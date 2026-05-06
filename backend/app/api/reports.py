import csv
from calendar import monthrange
from datetime import datetime, timedelta, timezone
from io import BytesIO, StringIO
from typing import List

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import Category, Transaction, TransactionType, User
from app.schemas.schemas import CategorySummary, MonthlyReport

router = APIRouter(prefix="/reports", tags=["Reports"])


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def build_monthly_report(db: Session, user_id: int, target: datetime) -> MonthlyReport:
    start = target.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    _, last_day = monthrange(target.year, target.month)
    end = target.replace(day=last_day, hour=23, minute=59, second=59, microsecond=0)

    income = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.INCOME.value,
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .scalar()
    )
    expense = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE.value,
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .scalar()
    )

    categories_data = (
        db.query(
            Category.id,
            Category.name,
            Category.color,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == TransactionType.EXPENSE.value,
            Transaction.date >= start,
            Transaction.date <= end,
        )
        .group_by(Category.id, Category.name, Category.color)
        .order_by(desc("total"))
        .all()
    )

    categories = [
        CategorySummary(
            category_id=row[0],
            category_name=row[1],
            category_color=row[2],
            total_amount=float(row[3]),
            transaction_count=row[4],
            percentage=round(float(row[3]) / float(expense) * 100, 1) if float(expense) > 0 else 0,
        )
        for row in categories_data
    ]

    return MonthlyReport(
        month=start.strftime("%Y-%m"),
        income=round(float(income), 2),
        expense=round(float(expense), 2),
        net=round(float(income) - float(expense), 2),
        categories=categories,
    )


@router.get("/monthly", response_model=List[MonthlyReport])
def get_monthly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    months: int = Query(6, ge=1, le=24),
):
    now = utcnow()
    return [build_monthly_report(db, current_user.id, now - timedelta(days=30 * i)) for i in range(months)]


@router.get("/export/csv")
def export_report_csv(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = get_monthly_report(db=db, current_user=current_user, months=months)
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Month", "Income", "Expense", "Net"])
    for report in reports:
        writer.writerow([report.month, report.income, report.expense, report.net])
        for category in report.categories:
            writer.writerow(["", category.category_name, category.total_amount, f"{category.percentage}%"])

    csv_bytes = BytesIO(buffer.getvalue().encode("utf-8-sig"))
    filename = f"finance-report-{current_user.id}-{utcnow().strftime('%Y%m%d%H%M%S')}.csv"
    return StreamingResponse(
        csv_bytes,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/pdf")
def export_report_pdf(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont
    from reportlab.pdfgen import canvas

    reports = get_monthly_report(db=db, current_user=current_user, months=months)
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiMin-W3"))

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setFont("HeiseiMin-W3", 14)
    pdf.drawString(40, 800, f"Bao cao tai chinh - {current_user.name}")

    y = 770
    pdf.setFont("HeiseiMin-W3", 10)
    for report in reports:
        if y < 120:
            pdf.showPage()
            pdf.setFont("HeiseiMin-W3", 10)
            y = 800
        pdf.drawString(40, y, f"Thang {report.month}: Thu {report.income:,.0f} - Chi {report.expense:,.0f} - Rong {report.net:,.0f}")
        y -= 18
        for category in report.categories[:6]:
            pdf.drawString(60, y, f"- {category.category_name}: {category.total_amount:,.0f} ({category.percentage}%)")
            y -= 14
        y -= 8

    pdf.save()
    buffer.seek(0)
    filename = f"finance-report-{current_user.id}-{utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

import sqlite3
from typing import Dict, Any, List, Optional
from app.database.connection import get_db_conn
from app.schemas.analytics import FilterParams

def build_filter_clauses(
    filters: FilterParams,
    table_prefix: str = "",
    allow_category: bool = True
) -> tuple[str, list]:
    conditions = []
    params = []

    p = f"{table_prefix}." if table_prefix else ""

    if filters.start_date:
        conditions.append(f"{p}order_date >= ?")
        params.append(filters.start_date)

    if filters.end_date:
        conditions.append(f"{p}order_date <= ?")
        params.append(filters.end_date)

    if filters.outlet:
        outlets = [o.strip() for o in filters.outlet.split(",") if o.strip()]
        if len(outlets) == 1:
            conditions.append(f"{p}outlet_name = ?")
            params.append(outlets[0])
        elif len(outlets) > 1:
            placeholders = ",".join("?" for _ in outlets)
            conditions.append(f"{p}outlet_name IN ({placeholders})")
            params.extend(outlets)

    if filters.order_type:
        types = [t.strip() for t in filters.order_type.split(",") if t.strip()]
        if len(types) == 1:
            conditions.append(f"{p}order_type = ?")
            params.append(types[0])
        elif len(types) > 1:
            placeholders = ",".join("?" for _ in types)
            conditions.append(f"{p}order_type IN ({placeholders})")
            params.extend(types)

    if filters.settlement:
        settles = [s.strip() for s in filters.settlement.split(",") if s.strip()]
        if len(settles) == 1:
            conditions.append(f"{p}settlement = ?")
            params.append(settles[0])
        elif len(settles) > 1:
            placeholders = ",".join("?" for _ in settles)
            conditions.append(f"{p}settlement IN ({placeholders})")
            params.extend(settles)

    if allow_category and filters.category:
        cats = [c.strip() for c in filters.category.split(",") if c.strip()]
        if len(cats) == 1:
            conditions.append(f"{p}category = ?")
            params.append(cats[0])
        elif len(cats) > 1:
            placeholders = ",".join("?" for _ in cats)
            conditions.append(f"{p}category IN ({placeholders})")
            params.extend(cats)

    where_sql = " AND ".join(conditions) if conditions else "1=1"
    return where_sql, params

class AnalyticsService:

    @staticmethod
    def get_summary(filters: FilterParams) -> Dict[str, Any]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        # Main KPI query using exact mathematical logic
        query = f"""
        SELECT 
            ROUND(COALESCE(SUM(revenue), 0), 2) as total_revenue,
            COUNT(DISTINCT bill_no) as total_orders,
            COALESCE(SUM(quantity), 0) as total_items_sold,
            COUNT(DISTINCT outlet_name) as total_outlets
        FROM orders
        WHERE {where_sql};
        """
        cur.execute(query, params)
        row = cur.fetchone()

        total_rev = float(row["total_revenue"] or 0)
        total_orders = int(row["total_orders"] or 0)
        total_items = int(row["total_items_sold"] or 0)
        total_outlets = int(row["total_outlets"] or 0)

        aov = round(total_rev / total_orders, 2) if total_orders > 0 else 0.0
        avg_items = round(total_items / total_orders, 2) if total_orders > 0 else 0.0

        # Top Outlet
        cur.execute(f"""
        SELECT outlet_name, ROUND(SUM(revenue), 2) as rev, COUNT(DISTINCT bill_no) as orders
        FROM orders
        WHERE {where_sql}
        GROUP BY outlet_name
        ORDER BY rev DESC
        LIMIT 1;
        """, params)
        top_outlet_row = cur.fetchone()
        top_outlet = {
            "name": top_outlet_row["outlet_name"] if top_outlet_row else "N/A",
            "revenue": float(top_outlet_row["rev"] if top_outlet_row else 0),
            "share_pct": round((float(top_outlet_row["rev"]) / total_rev * 100), 2) if top_outlet_row and total_rev > 0 else 0.0
        }

        # Top Category
        cur.execute(f"""
        SELECT category, ROUND(SUM(revenue), 2) as rev, SUM(quantity) as qty
        FROM orders
        WHERE {where_sql}
        GROUP BY category
        ORDER BY rev DESC
        LIMIT 1;
        """, params)
        top_cat_row = cur.fetchone()
        top_category = {
            "name": top_cat_row["category"] if top_cat_row else "N/A",
            "revenue": float(top_cat_row["rev"] if top_cat_row else 0),
            "share_pct": round((float(top_cat_row["rev"]) / total_rev * 100), 2) if top_cat_row and total_rev > 0 else 0.0
        }

        # Top Product
        cur.execute(f"""
        SELECT item, category, ROUND(SUM(revenue), 2) as rev, SUM(quantity) as qty
        FROM orders
        WHERE {where_sql}
        GROUP BY item, category
        ORDER BY rev DESC
        LIMIT 1;
        """, params)
        top_prod_row = cur.fetchone()
        top_product = {
            "name": top_prod_row["item"] if top_prod_row else "N/A",
            "category": top_prod_row["category"] if top_prod_row else "N/A",
            "revenue": float(top_prod_row["rev"] if top_prod_row else 0),
            "quantity": int(top_prod_row["qty"] if top_prod_row else 0)
        }

        conn.close()

        return {
            "total_revenue": total_rev,
            "total_orders": total_orders,
            "total_items_sold": total_items,
            "avg_order_value": aov,
            "avg_items_per_order": avg_items,
            "total_outlets": total_outlets,
            "top_outlet": top_outlet,
            "top_category": top_category,
            "top_product": top_product
        }

    @staticmethod
    def get_revenue_trend(filters: FilterParams, aggregation: str = "daily") -> List[Dict[str, Any]]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        if aggregation == "monthly":
            group_expr = "strftime('%Y-%m', order_date)"
        elif aggregation == "weekly":
            group_expr = "strftime('%Y-W%W', order_date)"
        else:
            group_expr = "order_date"

        query = f"""
        SELECT 
            {group_expr} as period,
            ROUND(SUM(revenue), 2) as revenue,
            COUNT(DISTINCT bill_no) as orders,
            SUM(quantity) as items,
            ROUND(SUM(revenue) / COUNT(DISTINCT bill_no), 2) as aov
        FROM orders
        WHERE {where_sql}
        GROUP BY {group_expr}
        ORDER BY period ASC;
        """
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()

        return [
            {
                "period": r["period"],
                "revenue": float(r["revenue"] or 0),
                "orders": int(r["orders"] or 0),
                "items": int(r["items"] or 0),
                "aov": float(r["aov"] or 0)
            }
            for r in rows
        ]

    @staticmethod
    def get_orders_trend(filters: FilterParams, aggregation: str = "daily") -> List[Dict[str, Any]]:
        trend = AnalyticsService.get_revenue_trend(filters, aggregation)
        return [{"period": t["period"], "orders": t["orders"], "revenue": t["revenue"]} for t in trend]

    @staticmethod
    def get_category_performance(filters: FilterParams) -> List[Dict[str, Any]]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        # Get total for share calculation
        cur.execute(f"SELECT COALESCE(SUM(revenue), 0) FROM orders WHERE {where_sql};", params)
        total_rev = cur.fetchone()[0] or 1.0

        query = f"""
        SELECT 
            category,
            ROUND(SUM(revenue), 2) as revenue,
            SUM(quantity) as quantity,
            COUNT(DISTINCT bill_no) as orders
        FROM orders
        WHERE {where_sql}
        GROUP BY category
        ORDER BY revenue DESC;
        """
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()

        return [
            {
                "category": r["category"],
                "revenue": float(r["revenue"] or 0),
                "quantity": int(r["quantity"] or 0),
                "orders": int(r["orders"] or 0),
                "share_pct": round((float(r["revenue"] or 0) / total_rev) * 100, 2)
            }
            for r in rows
        ]

    @staticmethod
    def get_order_type_distribution(filters: FilterParams) -> List[Dict[str, Any]]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        cur.execute(f"SELECT COALESCE(SUM(revenue), 0) FROM orders WHERE {where_sql};", params)
        total_rev = cur.fetchone()[0] or 1.0

        query = f"""
        SELECT 
            order_type as name,
            ROUND(SUM(revenue), 2) as revenue,
            COUNT(DISTINCT bill_no) as orders
        FROM orders
        WHERE {where_sql}
        GROUP BY order_type
        ORDER BY revenue DESC;
        """
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()

        return [
            {
                "name": r["name"],
                "revenue": float(r["revenue"] or 0),
                "orders": int(r["orders"] or 0),
                "share_pct": round((float(r["revenue"] or 0) / total_rev) * 100, 2)
            }
            for r in rows
        ]

    @staticmethod
    def get_payment_distribution(filters: FilterParams) -> List[Dict[str, Any]]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        cur.execute(f"SELECT COALESCE(SUM(revenue), 0) FROM orders WHERE {where_sql};", params)
        total_rev = cur.fetchone()[0] or 1.0

        query = f"""
        SELECT 
            settlement as name,
            ROUND(SUM(revenue), 2) as revenue,
            COUNT(DISTINCT bill_no) as orders
        FROM orders
        WHERE {where_sql}
        GROUP BY settlement
        ORDER BY revenue DESC;
        """
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()

        return [
            {
                "name": r["name"],
                "revenue": float(r["revenue"] or 0),
                "orders": int(r["orders"] or 0),
                "share_pct": round((float(r["revenue"] or 0) / total_rev) * 100, 2)
            }
            for r in rows
        ]

    @staticmethod
    def get_top_products(filters: FilterParams, limit: int = 10, order_by: str = "quantity") -> List[Dict[str, Any]]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        cur.execute(f"SELECT COALESCE(SUM(revenue), 0) FROM orders WHERE {where_sql};", params)
        total_rev = cur.fetchone()[0] or 1.0

        sort_col = "SUM(quantity)" if order_by == "quantity" else "SUM(revenue)"

        query = f"""
        SELECT 
            item as product,
            category,
            SUM(quantity) as quantity_sold,
            ROUND(SUM(revenue), 2) as total_revenue,
            ROUND(SUM(revenue) / SUM(quantity), 2) as avg_selling_price
        FROM orders
        WHERE {where_sql}
        GROUP BY item, category
        ORDER BY {sort_col} DESC
        LIMIT ?;
        """
        cur.execute(query, params + [limit])
        rows = cur.fetchall()
        conn.close()

        result = []
        for idx, r in enumerate(rows, 1):
            rev = float(r["total_revenue"] or 0)
            result.append({
                "rank": idx,
                "product": r["product"],
                "category": r["category"],
                "quantity_sold": int(r["quantity_sold"] or 0),
                "total_revenue": rev,
                "avg_selling_price": float(r["avg_selling_price"] or 0),
                "revenue_contribution_pct": round((rev / total_rev) * 100, 2)
            })
        return result

    @staticmethod
    def get_outlet_performance(filters: FilterParams) -> List[Dict[str, Any]]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        cur.execute(f"SELECT COALESCE(SUM(revenue), 0) FROM orders WHERE {where_sql};", params)
        total_rev = cur.fetchone()[0] or 1.0

        query = f"""
        SELECT 
            outlet_name,
            ROUND(SUM(revenue), 2) as revenue,
            COUNT(DISTINCT bill_no) as orders,
            ROUND(SUM(revenue) / COUNT(DISTINCT bill_no), 2) as aov,
            SUM(quantity) as items_sold
        FROM orders
        WHERE {where_sql}
        GROUP BY outlet_name
        ORDER BY revenue DESC;
        """
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()

        return [
            {
                "outlet_name": r["outlet_name"],
                "revenue": float(r["revenue"] or 0),
                "orders": int(r["orders"] or 0),
                "aov": float(r["aov"] or 0),
                "items_sold": int(r["items_sold"] or 0),
                "share_pct": round((float(r["revenue"] or 0) / total_rev) * 100, 2)
            }
            for r in rows
        ]

    @staticmethod
    def get_sales_analytics(filters: FilterParams) -> Dict[str, Any]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        # Sales by day of week
        cur.execute(f"""
        SELECT day_of_week, ROUND(SUM(revenue), 2) as revenue, COUNT(DISTINCT bill_no) as orders
        FROM orders
        WHERE {where_sql}
        GROUP BY day_of_week
        ORDER BY CASE day_of_week
            WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7
        END;
        """, params)
        dow_sales = [{"day": r["day_of_week"], "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

        # Sales by hour
        cur.execute(f"""
        SELECT order_hour, ROUND(SUM(revenue), 2) as revenue, COUNT(DISTINCT bill_no) as orders
        FROM orders
        WHERE {where_sql}
        GROUP BY order_hour
        ORDER BY order_hour ASC;
        """, params)
        hourly_sales = [{"hour": f"{int(r['order_hour']):02d}:00", "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

        conn.close()

        daily_trend = AnalyticsService.get_revenue_trend(filters, "daily")
        weekly_trend = AnalyticsService.get_revenue_trend(filters, "weekly")
        monthly_trend = AnalyticsService.get_revenue_trend(filters, "monthly")
        by_outlet = AnalyticsService.get_outlet_performance(filters)
        by_order_type = AnalyticsService.get_order_type_distribution(filters)
        by_payment = AnalyticsService.get_payment_distribution(filters)

        return {
            "daily_sales": daily_trend,
            "weekly_sales": weekly_trend,
            "monthly_sales": monthly_trend,
            "sales_by_outlet": by_outlet,
            "sales_by_order_type": by_order_type,
            "sales_by_payment": by_payment,
            "sales_by_day_of_week": dow_sales,
            "sales_by_hour": hourly_sales
        }

    @staticmethod
    def get_product_analytics(filters: FilterParams, search: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)

        cur.execute(f"SELECT COALESCE(SUM(revenue), 0) FROM orders WHERE {where_sql};", params)
        total_rev = cur.fetchone()[0] or 1.0

        search_clause = ""
        search_params = []
        if search and search.strip():
            search_clause = " AND (item LIKE ? OR category LIKE ?)"
            q = f"%{search.strip()}%"
            search_params = [q, q]

        query = f"""
        SELECT 
            item as product,
            category,
            SUM(quantity) as quantity_sold,
            ROUND(SUM(revenue), 2) as total_revenue,
            ROUND(SUM(revenue) / SUM(quantity), 2) as avg_selling_price
        FROM orders
        WHERE {where_sql} {search_clause}
        GROUP BY item, category
        ORDER BY total_revenue DESC;
        """
        cur.execute(query, params + search_params)
        rows = cur.fetchall()
        conn.close()

        all_products = []
        for idx, r in enumerate(rows, 1):
            rev = float(r["total_revenue"] or 0)
            all_products.append({
                "rank": idx,
                "product": r["product"],
                "category": r["category"],
                "quantity_sold": int(r["quantity_sold"] or 0),
                "total_revenue": rev,
                "avg_selling_price": float(r["avg_selling_price"] or 0),
                "revenue_contribution_pct": round((rev / total_rev) * 100, 2)
            })

        top_selling = all_products[:5]
        lowest_selling = sorted(all_products, key=lambda x: x["quantity_sold"])[:5]
        by_category = AnalyticsService.get_category_performance(filters)

        return {
            "top_selling_products": top_selling,
            "lowest_selling_products": lowest_selling,
            "revenue_by_category": by_category,
            "products": all_products,
            "total_products_count": len(all_products)
        }

    @staticmethod
    def get_outlet_analytics(filters: FilterParams, selected_outlet: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_conn()
        cur = conn.cursor()

        where_sql, params = build_filter_clauses(filters)
        outlets_summary = AnalyticsService.get_outlet_performance(filters)

        drilldown = None
        target_outlet = selected_outlet or (outlets_summary[0]["outlet_name"] if outlets_summary else None)

        if target_outlet:
            sub_params = params.copy()
            cur.execute(f"""
            SELECT category, ROUND(SUM(revenue), 2) as revenue, SUM(quantity) as quantity
            FROM orders
            WHERE {where_sql} AND outlet_name = ?
            GROUP BY category
            ORDER BY revenue DESC;
            """, sub_params + [target_outlet])
            cat_mix = [{"category": r["category"], "revenue": float(r["revenue"] or 0), "quantity": int(r["quantity"] or 0)} for r in cur.fetchall()]

            cur.execute(f"""
            SELECT order_type, ROUND(SUM(revenue), 2) as revenue, COUNT(DISTINCT bill_no) as orders
            FROM orders
            WHERE {where_sql} AND outlet_name = ?
            GROUP BY order_type
            ORDER BY revenue DESC;
            """, sub_params + [target_outlet])
            type_mix = [{"order_type": r["order_type"], "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

            cur.execute(f"""
            SELECT order_hour, ROUND(SUM(revenue), 2) as revenue, COUNT(DISTINCT bill_no) as orders
            FROM orders
            WHERE {where_sql} AND outlet_name = ?
            GROUP BY order_hour
            ORDER BY order_hour ASC;
            """, sub_params + [target_outlet])
            hourly = [{"hour": f"{int(r['order_hour']):02d}:00", "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

            drilldown = {
                "outlet_name": target_outlet,
                "category_mix": cat_mix,
                "order_type_distribution": type_mix,
                "hourly_traffic": hourly
            }

        conn.close()

        return {
            "outlets_comparison": outlets_summary,
            "selected_outlet_drilldown": drilldown
        }

    @staticmethod
    def get_orders(
        filters: FilterParams,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        sort_by: str = "order_datetime",
        sort_order: str = "DESC"
    ) -> Dict[str, Any]:
        conn = get_db_conn()
        cur = conn.cursor()

        # Build conditions for bills table
        conditions = []
        params = []

        if filters.start_date:
            conditions.append("order_date >= ?")
            params.append(filters.start_date)

        if filters.end_date:
            conditions.append("order_date <= ?")
            params.append(filters.end_date)

        if filters.outlet:
            outlets = [o.strip() for o in filters.outlet.split(",") if o.strip()]
            if len(outlets) == 1:
                conditions.append("outlet_name = ?")
                params.append(outlets[0])
            elif len(outlets) > 1:
                placeholders = ",".join("?" for _ in outlets)
                conditions.append(f"outlet_name IN ({placeholders})")
                params.extend(outlets)

        if filters.order_type:
            types = [t.strip() for t in filters.order_type.split(",") if t.strip()]
            if len(types) == 1:
                conditions.append("order_type = ?")
                params.append(types[0])
            elif len(types) > 1:
                placeholders = ",".join("?" for _ in types)
                conditions.append(f"order_type IN ({placeholders})")
                params.extend(types)

        if filters.settlement:
            settles = [s.strip() for s in filters.settlement.split(",") if s.strip()]
            if len(settles) == 1:
                conditions.append("settlement = ?")
                params.append(settles[0])
            elif len(settles) > 1:
                placeholders = ",".join("?" for _ in settles)
                conditions.append(f"settlement IN ({placeholders})")
                params.extend(settles)

        if search and search.strip():
            # If search is a number, search bill_no; else search outlet or items
            q_str = search.strip()
            if q_str.isdigit():
                conditions.append("bill_no = ?")
                params.append(int(q_str))
            else:
                conditions.append("(outlet_name LIKE ? OR bill_no IN (SELECT bill_no FROM orders WHERE item LIKE ?))")
                params.extend([f"%{q_str}%", f"%{q_str}%"])

        where_sql = " AND ".join(conditions) if conditions else "1=1"

        # Count total
        cur.execute(f"SELECT COUNT(*) FROM bills WHERE {where_sql};", params)
        total_orders = cur.fetchone()[0]

        total_pages = max(1, (total_orders + limit - 1) // limit)
        offset = (page - 1) * limit

        valid_sort_cols = {
            "bill_no": "bill_no",
            "order_datetime": "order_datetime",
            "outlet_name": "outlet_name",
            "total_revenue": "total_revenue",
            "total_quantity": "total_quantity"
        }
        order_col = valid_sort_cols.get(sort_by, "order_datetime")
        direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        query = f"""
        SELECT 
            bill_no, order_datetime, order_date, outlet_name, brand,
            order_type, settlement, line_items_count, total_quantity, total_revenue
        FROM bills
        WHERE {where_sql}
        ORDER BY {order_col} {direction}
        LIMIT ? OFFSET ?;
        """
        cur.execute(query, params + [limit, offset])
        rows = cur.fetchall()
        conn.close()

        orders = [
            {
                "bill_no": r["bill_no"],
                "order_datetime": r["order_datetime"],
                "order_date": r["order_date"],
                "outlet": r["outlet_name"],
                "brand": r["brand"],
                "order_type": r["order_type"],
                "settlement": r["settlement"],
                "line_items_count": r["line_items_count"],
                "total_quantity": float(r["total_quantity"]),
                "order_revenue": float(r["total_revenue"])
            }
            for r in rows
        ]

        return {
            "orders": orders,
            "total_orders": total_orders,
            "total_pages": total_pages,
            "page": page,
            "limit": limit
        }

    @staticmethod
    def get_order_details(bill_no: int) -> Optional[Dict[str, Any]]:
        conn = get_db_conn()
        cur = conn.cursor()

        cur.execute("""
        SELECT 
            bill_no, order_datetime, order_date, outlet_name, brand,
            order_type, settlement, line_items_count, total_quantity, total_revenue
        FROM bills
        WHERE bill_no = ?;
        """, (bill_no,))
        bill_row = cur.fetchone()

        if not bill_row:
            conn.close()
            return None

        cur.execute("""
        SELECT item, category, price, quantity, revenue
        FROM orders
        WHERE bill_no = ?
        ORDER BY revenue DESC;
        """, (bill_no,))
        item_rows = cur.fetchall()
        conn.close()

        items = [
            {
                "item": r["item"],
                "category": r["category"],
                "unit_price": float(r["price"]),
                "quantity": float(r["quantity"]),
                "line_revenue": float(r["revenue"])
            }
            for r in item_rows
        ]

        return {
            "bill_no": bill_row["bill_no"],
            "order_datetime": bill_row["order_datetime"],
            "order_date": bill_row["order_date"],
            "outlet": bill_row["outlet_name"],
            "brand": bill_row["brand"],
            "order_type": bill_row["order_type"],
            "settlement": bill_row["settlement"],
            "line_items_count": bill_row["line_items_count"],
            "total_quantity": float(bill_row["total_quantity"]),
            "order_revenue": float(bill_row["total_revenue"]),
            "items": items
        }

    @staticmethod
    def get_filters() -> Dict[str, Any]:
        conn = get_db_conn()
        cur = conn.cursor()

        cur.execute("SELECT DISTINCT outlet_name FROM orders ORDER BY outlet_name;")
        outlets = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT DISTINCT category FROM orders ORDER BY category;")
        categories = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT DISTINCT order_type FROM orders ORDER BY order_type;")
        order_types = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT DISTINCT settlement FROM orders ORDER BY settlement;")
        settlements = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT MIN(order_date), MAX(order_date) FROM orders;")
        date_min, date_max = cur.fetchone()

        conn.close()

        return {
            "outlets": outlets,
            "categories": categories,
            "order_types": order_types,
            "settlements": settlements,
            "date_range": [date_min, date_max]
        }

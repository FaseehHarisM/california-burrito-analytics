import threading
from collections import OrderedDict
from typing import Dict, Any, List, Optional, Callable
from app.database.connection import get_db_conn
from app.schemas.analytics import FilterParams

_CACHE_LOCK = threading.Lock()
_QUERY_CACHE: "OrderedDict[tuple, Any]" = OrderedDict()
_MAX_CACHE_ENTRIES = 256
_DATE_BOUNDS_CACHE: Optional[tuple[str, str]] = None


def _get_date_bounds() -> tuple[str, str]:
    global _DATE_BOUNDS_CACHE
    if _DATE_BOUNDS_CACHE is not None:
        return _DATE_BOUNDS_CACHE
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT MIN(order_date), MAX(order_date) FROM bills;")
    d_min, d_max = cur.fetchone()
    conn.close()
    _DATE_BOUNDS_CACHE = (d_min or "2025-06-17", d_max or "2026-06-16")
    return _DATE_BOUNDS_CACHE


def _filter_key(filters: FilterParams) -> tuple:
    min_d, max_d = _get_date_bounds()
    s = filters.start_date if (filters.start_date and filters.start_date > min_d) else None
    e = filters.end_date if (filters.end_date and filters.end_date < max_d) else None
    return (s, e, filters.outlet or None, filters.category or None, filters.order_type or None, filters.settlement or None)


def _cached(key: tuple, compute: Callable[[], Any]) -> Any:
    with _CACHE_LOCK:
        if key in _QUERY_CACHE:
            _QUERY_CACHE.move_to_end(key)
            return _QUERY_CACHE[key]
    value = compute()
    with _CACHE_LOCK:
        _QUERY_CACHE[key] = value
        _QUERY_CACHE.move_to_end(key)
        if len(_QUERY_CACHE) > _MAX_CACHE_ENTRIES:
            _QUERY_CACHE.popitem(last=False)
    return value


def build_filter_clauses(
    filters: FilterParams,
    table_prefix: str = "",
    allow_category: bool = True
) -> tuple[str, list]:
    conditions = []
    params = []

    p = f"{table_prefix}." if table_prefix else ""
    min_d, max_d = _get_date_bounds()

    # Skip non-restrictive date bounds so SQLite uses sequential scan instead of 100% index lookups
    if filters.start_date and filters.start_date > min_d:
        conditions.append(f"{p}order_date >= ?")
        params.append(filters.start_date)

    if filters.end_date and filters.end_date < max_d:
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
        key = ("summary", _filter_key(filters))

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            if not filters.category:
                where_b, params_b = build_filter_clauses(filters, allow_category=False)
                cur.execute(f"""
                SELECT
                    ROUND(COALESCE(SUM(total_revenue), 0), 2) as total_revenue,
                    COUNT(*) as total_orders,
                    COALESCE(SUM(total_quantity), 0) as total_items_sold,
                    COUNT(DISTINCT outlet_name) as total_outlets
                FROM bills
                WHERE {where_b};
                """, params_b)
                row = cur.fetchone()

                cur.execute(f"""
                SELECT outlet_name, ROUND(SUM(total_revenue), 2) as rev
                FROM bills
                WHERE {where_b}
                GROUP BY outlet_name
                ORDER BY rev DESC
                LIMIT 1;
                """, params_b)
                top_outlet_row = cur.fetchone()
            else:
                where_o, params_o = build_filter_clauses(filters)
                cur.execute(f"""
                SELECT
                    ROUND(COALESCE(SUM(revenue), 0), 2) as total_revenue,
                    COUNT(DISTINCT bill_no) as total_orders,
                    COALESCE(SUM(quantity), 0) as total_items_sold,
                    COUNT(DISTINCT outlet_name) as total_outlets
                FROM orders
                WHERE {where_o};
                """, params_o)
                row = cur.fetchone()

                cur.execute(f"""
                SELECT outlet_name, ROUND(SUM(revenue), 2) as rev
                FROM orders
                WHERE {where_o}
                GROUP BY outlet_name
                ORDER BY rev DESC
                LIMIT 1;
                """, params_o)
                top_outlet_row = cur.fetchone()

            total_rev = float(row["total_revenue"] or 0)
            total_orders = int(row["total_orders"] or 0)
            total_items = int(row["total_items_sold"] or 0)
            total_outlets = int(row["total_outlets"] or 0)

            aov = round(total_rev / total_orders, 2) if total_orders > 0 else 0.0
            avg_items = round(total_items / total_orders, 2) if total_orders > 0 else 0.0

            top_outlet = {
                "name": top_outlet_row["outlet_name"] if top_outlet_row else "N/A",
                "revenue": float(top_outlet_row["rev"] if top_outlet_row else 0),
                "share_pct": round((float(top_outlet_row["rev"]) / total_rev * 100), 2) if top_outlet_row and total_rev > 0 else 0.0
            }

            where_sql, params = build_filter_clauses(filters)

            # Top Category
            cur.execute(f"""
            SELECT category, ROUND(SUM(revenue), 2) as rev
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

        return _cached(key, _compute)

    @staticmethod
    def get_revenue_trend(filters: FilterParams, aggregation: str = "daily") -> List[Dict[str, Any]]:
        key = ("rev_trend", _filter_key(filters), aggregation)

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            if aggregation == "monthly":
                group_expr = "strftime('%Y-%m', order_date)"
            elif aggregation == "weekly":
                group_expr = "strftime('%Y-W%W', order_date)"
            else:
                group_expr = "order_date"

            if not filters.category:
                where_sql, params = build_filter_clauses(filters, allow_category=False)
                query = f"""
                SELECT
                    {group_expr} as period,
                    ROUND(SUM(total_revenue), 2) as revenue,
                    COUNT(*) as orders,
                    SUM(total_quantity) as items,
                    ROUND(SUM(total_revenue) / COUNT(*), 2) as aov
                FROM bills
                WHERE {where_sql}
                GROUP BY {group_expr}
                ORDER BY period ASC;
                """
            else:
                where_sql, params = build_filter_clauses(filters)
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

        return _cached(key, _compute)

    @staticmethod
    def get_orders_trend(filters: FilterParams, aggregation: str = "daily") -> List[Dict[str, Any]]:
        trend = AnalyticsService.get_revenue_trend(filters, aggregation)
        return [{"period": t["period"], "orders": t["orders"], "revenue": t["revenue"]} for t in trend]

    @staticmethod
    def get_category_performance(filters: FilterParams) -> List[Dict[str, Any]]:
        key = ("cat_perf", _filter_key(filters))

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            where_sql, params = build_filter_clauses(filters)

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

            total_rev = sum(float(r["revenue"] or 0) for r in rows) or 1.0

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

        return _cached(key, _compute)

    @staticmethod
    def get_order_type_distribution(filters: FilterParams) -> List[Dict[str, Any]]:
        key = ("order_type_dist", _filter_key(filters))

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            if not filters.category:
                where_sql, params = build_filter_clauses(filters, allow_category=False)
                query = f"""
                SELECT
                    order_type as name,
                    ROUND(SUM(total_revenue), 2) as revenue,
                    COUNT(*) as orders
                FROM bills
                WHERE {where_sql}
                GROUP BY order_type
                ORDER BY revenue DESC;
                """
            else:
                where_sql, params = build_filter_clauses(filters)
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

            total_rev = sum(float(r["revenue"] or 0) for r in rows) or 1.0
            return [
                {
                    "name": r["name"],
                    "revenue": float(r["revenue"] or 0),
                    "orders": int(r["orders"] or 0),
                    "share_pct": round((float(r["revenue"] or 0) / total_rev) * 100, 2)
                }
                for r in rows
            ]

        return _cached(key, _compute)

    @staticmethod
    def get_payment_distribution(filters: FilterParams) -> List[Dict[str, Any]]:
        key = ("payment_dist", _filter_key(filters))

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            if not filters.category:
                where_sql, params = build_filter_clauses(filters, allow_category=False)
                query = f"""
                SELECT
                    settlement as name,
                    ROUND(SUM(total_revenue), 2) as revenue,
                    COUNT(*) as orders
                FROM bills
                WHERE {where_sql}
                GROUP BY settlement
                ORDER BY revenue DESC;
                """
            else:
                where_sql, params = build_filter_clauses(filters)
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

            total_rev = sum(float(r["revenue"] or 0) for r in rows) or 1.0
            return [
                {
                    "name": r["name"],
                    "revenue": float(r["revenue"] or 0),
                    "orders": int(r["orders"] or 0),
                    "share_pct": round((float(r["revenue"] or 0) / total_rev) * 100, 2)
                }
                for r in rows
            ]

        return _cached(key, _compute)

    @staticmethod
    def get_top_products(filters: FilterParams, limit: int = 10, order_by: str = "quantity") -> List[Dict[str, Any]]:
        key = ("top_products", _filter_key(filters), limit, order_by)

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            where_sql, params = build_filter_clauses(filters)
            sort_col = "SUM(quantity)" if order_by == "quantity" else "SUM(revenue)"

            # Fetch all items and sum total_rev cleanly in one single scan
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
            ORDER BY {sort_col} DESC;
            """
            cur.execute(query, params)
            rows = cur.fetchall()
            conn.close()

            total_rev = sum(float(r["total_revenue"] or 0) for r in rows) or 1.0

            result = []
            for idx, r in enumerate(rows[:limit], 1):
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

        return _cached(key, _compute)

    @staticmethod
    def get_outlet_performance(filters: FilterParams) -> List[Dict[str, Any]]:
        key = ("outlet_perf", _filter_key(filters))

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            if not filters.category:
                where_sql, params = build_filter_clauses(filters, allow_category=False)
                query = f"""
                SELECT
                    outlet_name,
                    ROUND(SUM(total_revenue), 2) as revenue,
                    COUNT(*) as orders,
                    ROUND(SUM(total_revenue) / COUNT(*), 2) as aov,
                    SUM(total_quantity) as items_sold
                FROM bills
                WHERE {where_sql}
                GROUP BY outlet_name
                ORDER BY revenue DESC;
                """
            else:
                where_sql, params = build_filter_clauses(filters)
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

            total_rev = sum(float(r["revenue"] or 0) for r in rows) or 1.0
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

        return _cached(key, _compute)

    @staticmethod
    def get_sales_analytics(filters: FilterParams) -> Dict[str, Any]:
        key = ("sales_analytics", _filter_key(filters))

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            if not filters.category:
                where_sql, params = build_filter_clauses(filters, allow_category=False)
                cur.execute(f"""
                SELECT day_of_week, ROUND(SUM(total_revenue), 2) as revenue, COUNT(*) as orders
                FROM bills
                WHERE {where_sql}
                GROUP BY day_of_week
                ORDER BY CASE day_of_week
                    WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7
                END;
                """, params)
                dow_sales = [{"day": r["day_of_week"], "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

                cur.execute(f"""
                SELECT order_hour, ROUND(SUM(total_revenue), 2) as revenue, COUNT(*) as orders
                FROM bills
                WHERE {where_sql}
                GROUP BY order_hour
                ORDER BY order_hour ASC;
                """, params)
                hourly_sales = [{"hour": f"{int(r['order_hour']):02d}:00", "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]
            else:
                where_sql, params = build_filter_clauses(filters)
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

        return _cached(key, _compute)

    @staticmethod
    def get_product_analytics(filters: FilterParams, search: Optional[str] = None) -> Dict[str, Any]:
        search_norm = (search or "").strip().lower()
        key = ("product_analytics", _filter_key(filters), search_norm)

        def _compute():
            conn = get_db_conn()
            cur = conn.cursor()

            where_sql, params = build_filter_clauses(filters)

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
            ORDER BY total_revenue DESC;
            """
            cur.execute(query, params)
            rows = cur.fetchall()
            conn.close()

            total_rev = sum(float(r["total_revenue"] or 0) for r in rows) or 1.0

            filtered_rows = rows
            if search_norm:
                filtered_rows = [
                    r for r in rows
                    if search_norm in r["product"].lower() or search_norm in r["category"].lower()
                ]

            all_products = []
            for idx, r in enumerate(filtered_rows, 1):
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

        return _cached(key, _compute)

    @staticmethod
    def get_outlet_analytics(filters: FilterParams, selected_outlet: Optional[str] = None) -> Dict[str, Any]:
        outlets_summary = AnalyticsService.get_outlet_performance(filters)
        target_outlet = selected_outlet or (outlets_summary[0]["outlet_name"] if outlets_summary else None)

        key = ("outlet_analytics", _filter_key(filters), target_outlet)

        def _compute():
            drilldown = None
            if target_outlet:
                conn = get_db_conn()
                cur = conn.cursor()

                where_o, params_o = build_filter_clauses(filters)
                cur.execute(f"""
                SELECT category, ROUND(SUM(revenue), 2) as revenue, SUM(quantity) as quantity
                FROM orders
                WHERE {where_o} AND outlet_name = ?
                GROUP BY category
                ORDER BY revenue DESC;
                """, params_o + [target_outlet])
                cat_mix = [{"category": r["category"], "revenue": float(r["revenue"] or 0), "quantity": int(r["quantity"] or 0)} for r in cur.fetchall()]

                if not filters.category:
                    where_b, params_b = build_filter_clauses(filters, allow_category=False)
                    cur.execute(f"""
                    SELECT order_type, ROUND(SUM(total_revenue), 2) as revenue, COUNT(*) as orders
                    FROM bills
                    WHERE {where_b} AND outlet_name = ?
                    GROUP BY order_type
                    ORDER BY revenue DESC;
                    """, params_b + [target_outlet])
                    type_mix = [{"order_type": r["order_type"], "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

                    cur.execute(f"""
                    SELECT order_hour, ROUND(SUM(total_revenue), 2) as revenue, COUNT(*) as orders
                    FROM bills
                    WHERE {where_b} AND outlet_name = ?
                    GROUP BY order_hour
                    ORDER BY order_hour ASC;
                    """, params_b + [target_outlet])
                    hourly = [{"hour": f"{int(r['order_hour']):02d}:00", "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]
                else:
                    cur.execute(f"""
                    SELECT order_type, ROUND(SUM(revenue), 2) as revenue, COUNT(DISTINCT bill_no) as orders
                    FROM orders
                    WHERE {where_o} AND outlet_name = ?
                    GROUP BY order_type
                    ORDER BY revenue DESC;
                    """, params_o + [target_outlet])
                    type_mix = [{"order_type": r["order_type"], "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

                    cur.execute(f"""
                    SELECT order_hour, ROUND(SUM(revenue), 2) as revenue, COUNT(DISTINCT bill_no) as orders
                    FROM orders
                    WHERE {where_o} AND outlet_name = ?
                    GROUP BY order_hour
                    ORDER BY order_hour ASC;
                    """, params_o + [target_outlet])
                    hourly = [{"hour": f"{int(r['order_hour']):02d}:00", "revenue": float(r["revenue"] or 0), "orders": int(r["orders"] or 0)} for r in cur.fetchall()]

                conn.close()
                drilldown = {
                    "outlet_name": target_outlet,
                    "category_mix": cat_mix,
                    "order_type_distribution": type_mix,
                    "hourly_traffic": hourly
                }

            return {
                "outlets_comparison": outlets_summary,
                "selected_outlet_drilldown": drilldown
            }

        return _cached(key, _compute)

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

        valid_sort_cols = {
            "bill_no": "bill_no",
            "order_datetime": "order_datetime",
            "outlet_name": "outlet_name",
            "total_revenue": "total_revenue",
            "total_quantity": "total_quantity"
        }
        order_col = valid_sort_cols.get(sort_by, "order_datetime")
        direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        offset = (page - 1) * limit

        if not filters.category:
            where_sql, params = build_filter_clauses(filters, allow_category=False)
            conditions = [where_sql] if where_sql != "1=1" else []

            if search and search.strip():
                q_str = search.strip()
                if q_str.isdigit():
                    conditions.append("bill_no = ?")
                    params.append(int(q_str))
                else:
                    conditions.append("(outlet_name LIKE ? OR bill_no IN (SELECT bill_no FROM orders WHERE item LIKE ?))")
                    params.extend([f"%{q_str}%", f"%{q_str}%"])

            final_where = " AND ".join(conditions) if conditions else "1=1"

            cur.execute(f"SELECT COUNT(*) FROM bills WHERE {final_where};", params)
            total_orders = cur.fetchone()[0]
            total_pages = max(1, (total_orders + limit - 1) // limit)

            query = f"""
            SELECT
                bill_no, order_datetime, order_date, outlet_name, brand,
                order_type, settlement, line_items_count, total_quantity, total_revenue
            FROM bills
            WHERE {final_where}
            ORDER BY {order_col} {direction}
            LIMIT ? OFFSET ?;
            """
            cur.execute(query, params + [limit, offset])
        else:
            where_sql, params = build_filter_clauses(filters, allow_category=True)
            conditions = [where_sql] if where_sql != "1=1" else []

            if search and search.strip():
                q_str = search.strip()
                if q_str.isdigit():
                    conditions.append("bill_no = ?")
                    params.append(int(q_str))
                else:
                    conditions.append("(outlet_name LIKE ? OR item LIKE ?)")
                    params.extend([f"%{q_str}%", f"%{q_str}%"])

            final_where = " AND ".join(conditions) if conditions else "1=1"

            cur.execute(f"SELECT COUNT(DISTINCT bill_no) FROM orders WHERE {final_where};", params)
            total_orders = cur.fetchone()[0]
            total_pages = max(1, (total_orders + limit - 1) // limit)

            query = f"""
            SELECT
                bill_no,
                MIN(order_datetime) as order_datetime,
                order_date,
                outlet_name,
                brand,
                order_type,
                settlement,
                COUNT(*) as line_items_count,
                SUM(quantity) as total_quantity,
                ROUND(SUM(revenue), 2) as total_revenue
            FROM orders
            WHERE {final_where}
            GROUP BY bill_no
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
        return _cached(("filters",), AnalyticsService._compute_filters)

    @staticmethod
    def _compute_filters() -> Dict[str, Any]:
        conn = get_db_conn()
        cur = conn.cursor()

        cur.execute("SELECT DISTINCT outlet_name FROM bills ORDER BY outlet_name;")
        outlets = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT DISTINCT category FROM orders ORDER BY category;")
        categories = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT DISTINCT order_type FROM bills ORDER BY order_type;")
        order_types = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT DISTINCT settlement FROM bills ORDER BY settlement;")
        settlements = [r[0] for r in cur.fetchall()]

        cur.execute("SELECT MIN(order_date), MAX(order_date) FROM bills;")
        date_min, date_max = cur.fetchone()

        conn.close()

        return {
            "outlets": outlets,
            "categories": categories,
            "order_types": order_types,
            "settlements": settlements,
            "date_range": [date_min, date_max]
        }

    @staticmethod
    def warm_cache():
        f = FilterParams()
        AnalyticsService.get_filters()
        AnalyticsService.get_summary(f)
        AnalyticsService.get_revenue_trend(f, "monthly")
        AnalyticsService.get_category_performance(f)
        AnalyticsService.get_order_type_distribution(f)
        AnalyticsService.get_payment_distribution(f)
        AnalyticsService.get_top_products(f, 10, "quantity")
        AnalyticsService.get_outlet_performance(f)

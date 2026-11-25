import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/data-service";
import { FilterState } from "@/types/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const outlets = searchParams.get("outlets") ? searchParams.get("outlets")!.split(",") : undefined;
    const categories = searchParams.get("categories") ? searchParams.get("categories")!.split(",") : undefined;
    const orderTypes = searchParams.get("orderTypes") ? searchParams.get("orderTypes")!.split(",") : undefined;
    const settlements = searchParams.get("settlements") ? searchParams.get("settlements")!.split(",") : undefined;

    const filters: Partial<FilterState> = {
      startDate,
      endDate,
      outlets,
      categories,
      orderTypes,
      settlements,
    };

    const analytics = getAnalyticsData(filters);

    return NextResponse.json(analytics, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Failed to process analytics query", details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateCSVExport } from "@/lib/data-service";
import { FilterState } from "@/types/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const outlets = searchParams.get("outlets") ? searchParams.get("outlets")!.split(",") : undefined;
    const orderTypes = searchParams.get("orderTypes") ? searchParams.get("orderTypes")!.split(",") : undefined;
    const settlements = searchParams.get("settlements") ? searchParams.get("settlements")!.split(",") : undefined;

    const filters: Partial<FilterState> = {
      startDate,
      endDate,
      outlets,
      orderTypes,
      settlements,
    };

    const csvContent = generateCSVExport(filters);
    const filename = `burger-town-analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("CSV Export API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV export", details: error.message },
      { status: 500 }
    );
  }
}

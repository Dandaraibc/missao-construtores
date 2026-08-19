import { NextResponse } from "next/server";
import { getProjectDeadline } from "@/lib/server/deadlines";

export async function GET() {
  return NextResponse.json(await getProjectDeadline());
}

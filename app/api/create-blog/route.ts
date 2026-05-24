import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST() {
    console.log('hello from api route');
    return NextResponse.json({success: true});
}
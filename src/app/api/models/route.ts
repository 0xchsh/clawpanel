import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const { modelId } = await request.json();

  if (!modelId) {
    return NextResponse.json({ ok: false, error: "modelId required" }, { status: 400 });
  }

  try {
    await execAsync(`openclaw models set ${modelId}`);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string };
    return NextResponse.json(
      { ok: false, error: error.stderr ?? error.message ?? "unknown error" },
      { status: 500 }
    );
  }
}

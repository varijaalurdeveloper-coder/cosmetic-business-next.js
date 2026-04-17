import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * =========================
 * 🔐 VERIFY ADMIN SESSION (FIXED)
 * =========================
 */
export async function verifyAdminSession(): Promise<{
  isAdmin: boolean;
  user?: any;
  response?: NextResponse;
}> {
  try {
    const cookieStore = cookies();
    const adminSession = cookieStore.get("admin_session")?.value;

    if (!adminSession) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized. Please login." },
          { status: 401 }
        ),
      };
    }

    /**
     * 🔓 Decode your custom session
     * format: base64(email:timestamp:role)
     */
    let decoded = "";
    try {
      decoded = Buffer.from(adminSession, "base64").toString("utf-8");
    } catch {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { success: false, error: "Invalid session format" },
          { status: 401 }
        ),
      };
    }

    const [email, timestamp, role] = decoded.split(":");

    if (!email || !role) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { success: false, error: "Invalid session data" },
          { status: 401 }
        ),
      };
    }

    /**
     * ✅ Check admin role
     */
    if (role !== "admin") {
      return {
        isAdmin: false,
        response: NextResponse.json(
          { success: false, error: "Forbidden. Admin only." },
          { status: 403 }
        ),
      };
    }

    return {
      isAdmin: true,
      user: {
        email,
        role,
      },
    };
  } catch (error) {
    console.error("Admin session verification error:", error);

    return {
      isAdmin: false,
      response: NextResponse.json(
        { success: false, error: "Failed to verify admin access" },
        { status: 500 }
      ),
    };
  }
}

/**
 * =========================
 * 🛡️ WITH ADMIN AUTH WRAPPER
 * =========================
 */
export async function withAdminAuth(
  handler: (user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  const adminCheck = await verifyAdminSession();

  if (!adminCheck.isAdmin) {
    return (
      adminCheck.response ||
      NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    );
  }

  try {
    return await handler(adminCheck.user);
  } catch (error) {
    console.error("Admin route handler error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
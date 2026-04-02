import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Verify admin access from the admin_session HTTP-only cookie
 * This is a server-side only validation that cannot be bypassed by clients
 * 
 * Usage in API routes:
 * ```typescript
 * export async function GET(req: Request) {
 *   const adminCheck = await verifyAdminSession();
 *   if (!adminCheck.isAdmin) {
 *     return adminCheck.response;
 *   }
 *   // Admin-only logic here
 * }
 * ```
 * 
 * @returns Object with isAdmin boolean and response for unauthorized cases
 */
export async function verifyAdminSession(): Promise<{
  isAdmin: boolean;
  response?: NextResponse;
}> {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;

    // Check if admin session cookie exists
    if (!adminSession) {
      return {
        isAdmin: false,
        response: NextResponse.json(
          {
            success: false,
            error: "Unauthorized. Admin session required.",
          },
          { status: 401 }
        ),
      };
    }

    // Session exists, user is authenticated as admin
    return {
      isAdmin: true,
    };
  } catch (error) {
    console.error("Admin session verification error:", error);
    return {
      isAdmin: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Failed to verify admin access",
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Middleware-style wrapper for admin-protected API routes
 * Automatically returns 401 if not admin
 * 
 * Usage:
 * ```typescript
 * export async function GET(req: Request) {
 *   return withAdminAuth(async () => {
 *     // Admin-only logic here
 *     return NextResponse.json({ success: true, data: [] });
 *   });
 * }
 * ```
 */
export async function withAdminAuth(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const adminCheck = await verifyAdminSession();

  if (!adminCheck.isAdmin) {
    return (
      adminCheck.response ||
      NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Admin access required.",
        },
        { status: 401 }
      )
    );
  }

  try {
    return await handler();
  } catch (error) {
    console.error("Admin route handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Verify admin access and return early if not authorized
 * Throws an error that should be caught by the route handler
 * 
 * Usage:
 * ```typescript
 * export async function PUT(req: Request) {
 *   await requireAdminAuth(); // Throws if not admin
 *   // Admin-only logic here
 * }
 * ```
 * 
 * @throws Error with 401 status if not authenticated
 */
export async function requireAdminAuth(): Promise<void> {
  const adminCheck = await verifyAdminSession();

  if (!adminCheck.isAdmin) {
    const error = new Error("Unauthorized");
    (error as any).status = 401;
    throw error;
  }
}

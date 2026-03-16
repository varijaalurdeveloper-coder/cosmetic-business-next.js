import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock user creation - in production, use your auth provider
    const mockUser = {
      id: `user_${Date.now()}`,
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    };

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: `${mockUser.firstName} ${mockUser.lastName}`,
      },
      message: "Account created successfully. Please log in.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
      { status: 500 }
    );
  }
}
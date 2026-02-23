import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

// ── Helper: resolve or create cart ────────────────────────────────────────
async function getOrCreateCart(
  userId: string | null,
  sessionId: string | null
) {
  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                currency: true,
                stockQuantity: true,
                stockStatus: true,
                manageStock: true,
                images: {
                  where: { isDefault: true },
                  take: 1,
                  select: { url: true, alt: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                compareAtPrice: true,
                stockQuantity: true,
                stockStatus: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true,
            maxDiscount: true,
          },
        },
      },
    });

    if (cart) return cart;

    return prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                currency: true,
                stockQuantity: true,
                stockStatus: true,
                manageStock: true,
                images: {
                  where: { isDefault: true },
                  take: 1,
                  select: { url: true, alt: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                compareAtPrice: true,
                stockQuantity: true,
                stockStatus: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true,
            maxDiscount: true,
          },
        },
      },
    });
  }

  if (sessionId) {
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                currency: true,
                stockQuantity: true,
                stockStatus: true,
                manageStock: true,
                images: {
                  where: { isDefault: true },
                  take: 1,
                  select: { url: true, alt: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                compareAtPrice: true,
                stockQuantity: true,
                stockStatus: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true,
            maxDiscount: true,
          },
        },
      },
    });

    if (cart) return cart;

    return prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                currency: true,
                stockQuantity: true,
                stockStatus: true,
                manageStock: true,
                images: {
                  where: { isDefault: true },
                  take: 1,
                  select: { url: true, alt: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                compareAtPrice: true,
                stockQuantity: true,
                stockStatus: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true,
            maxDiscount: true,
          },
        },
      },
    });
  }

  return null;
}

// ── Helper: format cart response ──────────────────────────────────────────
function formatCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  if (!cart) return null;

  const items = cart.items.map((item) => {
    const unitPrice = item.variant
      ? Number(item.variant.price)
      : Number(item.product.price);
    const lineTotal = unitPrice * item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      product: item.product,
      variant: item.variant,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    coupon: cart.coupon,
  };
}

// ── GET: Retrieve cart ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    const sessionId = request.cookies.get("session-id")?.value ?? null;

    if (!authPayload && !sessionId) {
      return NextResponse.json(
        { cart: { items: [], itemCount: 0, subtotal: 0, coupon: null } },
        { status: 200 }
      );
    }

    const cart = await getOrCreateCart(
      authPayload?.userId ?? null,
      authPayload ? null : sessionId
    );

    return NextResponse.json({ cart: formatCart(cart) }, { status: 200 });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST: Add item to cart ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    const sessionId = request.cookies.get("session-id")?.value ?? null;

    if (!authPayload && !sessionId) {
      return NextResponse.json(
        { error: "A session or authentication is required to add items" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // Validate product exists and is published
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        status: true,
        stockQuantity: true,
        stockStatus: true,
        manageStock: true,
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check stock
    if (product.manageStock && product.stockStatus === "OUT_OF_STOCK") {
      return NextResponse.json(
        { error: "Product is out of stock" },
        { status: 400 }
      );
    }

    // Validate variant if provided
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: {
          id: true,
          productId: true,
          isActive: true,
          stockStatus: true,
          stockQuantity: true,
          manageStock: true,
        },
      });

      if (!variant || variant.productId !== productId || !variant.isActive) {
        return NextResponse.json(
          { error: "Product variant not found" },
          { status: 404 }
        );
      }

      if (variant.manageStock && variant.stockStatus === "OUT_OF_STOCK") {
        return NextResponse.json(
          { error: "Selected variant is out of stock" },
          { status: 400 }
        );
      }
    }

    const cart = await getOrCreateCart(
      authPayload?.userId ?? null,
      authPayload ? null : sessionId
    );

    if (!cart) {
      return NextResponse.json(
        { error: "Unable to create cart" },
        { status: 500 }
      );
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;

      // Stock check
      if (product.manageStock && newQty > product.stockQuantity) {
        return NextResponse.json(
          {
            error: `Only ${product.stockQuantity} units available`,
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      if (product.manageStock && quantity > product.stockQuantity) {
        return NextResponse.json(
          {
            error: `Only ${product.stockQuantity} units available`,
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      });
    }

    // Re-fetch cart
    const updatedCart = await getOrCreateCart(
      authPayload?.userId ?? null,
      authPayload ? null : sessionId
    );

    return NextResponse.json(
      { message: "Item added to cart", cart: formatCart(updatedCart) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── PUT: Update cart item quantity ────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    const sessionId = request.cookies.get("session-id")?.value ?? null;

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        { error: "Quantity must be 0 or greater" },
        { status: 400 }
      );
    }

    // Find the cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: { select: { userId: true, sessionId: true } },
        product: {
          select: { stockQuantity: true, manageStock: true },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const isOwner =
      (authPayload && cartItem.cart.userId === authPayload.userId) ||
      (!authPayload && cartItem.cart.sessionId === sessionId);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      // Check stock
      if (cartItem.product.manageStock && quantity > cartItem.product.stockQuantity) {
        return NextResponse.json(
          {
            error: `Only ${cartItem.product.stockQuantity} units available`,
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    // Re-fetch cart
    const updatedCart = await getOrCreateCart(
      authPayload?.userId ?? null,
      authPayload ? null : sessionId
    );

    return NextResponse.json(
      { message: "Cart updated", cart: formatCart(updatedCart) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE: Remove item from cart ─────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const authPayload = await getAuthUser(request);
    const sessionId = request.cookies.get("session-id")?.value ?? null;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId query parameter is required" },
        { status: 400 }
      );
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: { select: { userId: true, sessionId: true } },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    const isOwner =
      (authPayload && cartItem.cart.userId === authPayload.userId) ||
      (!authPayload && cartItem.cart.sessionId === sessionId);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    // Re-fetch cart
    const updatedCart = await getOrCreateCart(
      authPayload?.userId ?? null,
      authPayload ? null : sessionId
    );

    return NextResponse.json(
      { message: "Item removed from cart", cart: formatCart(updatedCart) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

-- CreateTable
CREATE TABLE "dummy" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dummy_pkey" PRIMARY KEY ("id")
);

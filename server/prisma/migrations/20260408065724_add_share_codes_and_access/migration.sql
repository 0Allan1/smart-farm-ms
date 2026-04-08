-- CreateTable
CREATE TABLE "ShareCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficerAccess" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficerAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareCode_code_key" ON "ShareCode"("code");

-- AddForeignKey
ALTER TABLE "ShareCode" ADD CONSTRAINT "ShareCode_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerAccess" ADD CONSTRAINT "OfficerAccess_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerAccess" ADD CONSTRAINT "OfficerAccess_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

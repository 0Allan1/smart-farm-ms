-- CreateTable
CREATE TABLE "OfficerAdvice" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficerAdvice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OfficerAdvice" ADD CONSTRAINT "OfficerAdvice_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficerAdvice" ADD CONSTRAINT "OfficerAdvice_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "StrollHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitedPlaceId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL,
    "strollTime" INTEGER NOT NULL,
    "steps" INTEGER NOT NULL,
    "calories" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "StrollHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrollHistoryCategory" (
    "strollHistoryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "StrollHistoryCategory_pkey" PRIMARY KEY ("strollHistoryId","categoryId")
);

-- CreateTable
CREATE TABLE "Picture" (
    "id" TEXT NOT NULL,
    "strollHistoryId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,

    CONSTRAINT "Picture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StrollHistory" ADD CONSTRAINT "StrollHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrollHistoryCategory" ADD CONSTRAINT "StrollHistoryCategory_strollHistoryId_fkey" FOREIGN KEY ("strollHistoryId") REFERENCES "StrollHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrollHistoryCategory" ADD CONSTRAINT "StrollHistoryCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_strollHistoryId_fkey" FOREIGN KEY ("strollHistoryId") REFERENCES "StrollHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

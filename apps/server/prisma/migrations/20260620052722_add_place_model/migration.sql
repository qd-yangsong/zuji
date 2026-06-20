-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "customName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "coverImage" TEXT,
    "checkinCount" INTEGER NOT NULL DEFAULT 0,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_tags" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "places_userId_idx" ON "places"("userId");

-- CreateIndex
CREATE INDEX "places_userId_collectedAt_idx" ON "places"("userId", "collectedAt");

-- CreateIndex
CREATE INDEX "place_tags_tagId_idx" ON "place_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "place_tags_placeId_tagId_key" ON "place_tags"("placeId", "tagId");

-- AddForeignKey
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

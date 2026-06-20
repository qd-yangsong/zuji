-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT,
    "images" TEXT[],
    "isFirst" BOOLEAN NOT NULL DEFAULT false,
    "checkinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkin_tags" (
    "id" TEXT NOT NULL,
    "checkinId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkin_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checkins_placeId_checkinAt_idx" ON "checkins"("placeId", "checkinAt");

-- CreateIndex
CREATE INDEX "checkins_userId_idx" ON "checkins"("userId");

-- CreateIndex
CREATE INDEX "checkin_tags_tagId_idx" ON "checkin_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "checkin_tags_checkinId_tagId_key" ON "checkin_tags"("checkinId", "tagId");

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_tags" ADD CONSTRAINT "checkin_tags_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "checkins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_tags" ADD CONSTRAINT "checkin_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

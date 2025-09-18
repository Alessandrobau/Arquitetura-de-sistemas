-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('AGUARDANDO_PAGAMENTO', 'FALHA_NO_PAGAMENTO', 'PAGO', 'CANCELADO');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "clientId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "status" "public"."OrderStatus" NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO';

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "motoristas" ADD COLUMN     "usuario_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "motoristas_usuario_id_key" ON "motoristas"("usuario_id");

-- AddForeignKey
ALTER TABLE "motoristas" ADD CONSTRAINT "motoristas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

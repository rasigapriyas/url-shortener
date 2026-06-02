const { PrismaClient } = require("@prisma/client");

console.log("Before");

const prisma = new PrismaClient();

console.log("After");
import { prisma } from "~/db.server";

export type { Player } from "@prisma/client";

export async function getPlayers(filter: string = "") {
  const players = await prisma.player.findMany({
    select: { id: true, name: true, level: true, vocation: true },
    orderBy: { experience: "desc" },
    where: {
      name: {
        contains: filter,
      },
    },
  });
  return players.map((player) => ({
    ...player,
    vocation: vocationFromId(player.vocation),
  }));
}

export async function getPlayerByName(name: string) {
  const player = await prisma.player.findUnique({
    where: { name },
    select: {
      id: true,
      name: true,
      level: true,
      sex: true,
      vocation: true,
      town: { select: { name: true } },
    },
  });
  if (!player) return null;
  return {
    ...player,
    vocation: vocationFromId(player.vocation),
    sex: sexFromId(player.sex),
    residence: player.town.name,
  };
}

export function vocationFromId(id: number) {
  const vocations = [
    "None",
    "Sorcerer",
    "Druid",
    "Paladin",
    "Knight",
    "Master Sorcerer",
    "Elder Druid",
    "Royal Paladin",
    "Elite Knight",
  ];
  return vocations[id];
}

export function sexFromId(id: number) {
  const genders = ["Female", "Male"];
  return genders[id];
}

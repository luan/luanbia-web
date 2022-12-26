import { prisma } from "~/db.server";

export type { Player } from "@prisma/client";

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
] as const;

const genders = ["Female", "Male"] as const;

export async function getPlayers(filter: {
  name: string | null;
  town: string | null;
  vocations: string[];
  genders: string[];
}) {
  const vocationFilter = filter.vocations.map(vocationsFromString).flat();
  const genderFilter = filter.genders.map(genderFromString);
  const players = await prisma.player.findMany({
    select: { id: true, name: true, level: true, vocation: true },
    orderBy: { experience: "desc" },
    where: {
      name: {
        contains: filter.name ?? "",
      },
      vocation: {
        in: vocationFilter.length ? vocationFilter : undefined,
      },
      sex: {
        in: genderFilter.length ? genderFilter : undefined,
      },
      town: {
        name: {
          contains: filter.town ?? "",
        },
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
      lastlogin: true,
      town: { select: { name: true } },
    },
  });
  if (!player) return null;
  return {
    ...player,
    vocation: vocationFromId(player.vocation),
    sex: sexFromId(player.sex),
    residence: player.town.name,
    lastlogin: new Date(Number(player.lastlogin) * 1000),
  };
}

function vocationFromId(id: number) {
  return vocations[id];
}

function sexFromId(id: number) {
  const genders = ["Female", "Male"];
  return genders[id];
}

function vocationsFromString(q: string): number[] {
  return vocations
    .map((vocation, idx) =>
      vocation.toLowerCase().includes(q.toLowerCase()) ? idx : null
    )
    .filter((vocation) => vocation !== null) as number[];
}

function genderFromString(q: string): number {
  return genders.findIndex(
    (gender, idx) => gender.toLowerCase() == q.toLowerCase()
  );
}

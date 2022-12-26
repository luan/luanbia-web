import type { Account, Player, Town } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { createHash } from "crypto";

const prisma = new PrismaClient();

enum Vocations {
  None = 0,
  Sorcerer = 1,
  Druid = 2,
  Paladin = 3,
  Knight = 4,

  MasterSorcerer = 5,
  ElderDruid = 6,
  RoyalPaladin = 7,
  EliteKnight = 8,
}

enum Sex {
  Female = 0,
  Male = 1,
}

enum GroupId {
  Player = 1,
  God = 6,
}

function getHealth(level: number, vocation: Vocations): number {
  let health = 145 + (level - 1) * 5;
  if (level >= 9) {
    switch (vocation) {
      case Vocations.Paladin:
      case Vocations.RoyalPaladin:
        health += (level - 8) * 10;
        break;
      case Vocations.Knight:
      case Vocations.EliteKnight:
        health += (level - 8) * 15;
        break;
    }
  }
  return health;
}

function getMana(level: number, vocation: Vocations): number {
  let mana = 50 + (level - 1) * 5;
  if (level >= 9) {
    switch (vocation) {
      case Vocations.Sorcerer:
      case Vocations.Druid:
      case Vocations.MasterSorcerer:
      case Vocations.ElderDruid:
        mana += (level - 8) * 30;
        break;
      case Vocations.Paladin:
      case Vocations.RoyalPaladin:
        mana += (level - 8) * 15;
        break;
    }
  }
  return mana;
}

function getCap(level: number, vocation: Vocations): number {
  let cap = 400 + (level - 1) * 10;
  if (level >= 9) {
    switch (vocation) {
      case Vocations.Paladin:
        cap += (level - 8) * 20;
        break;
      case Vocations.Knight:
        cap += (level - 8) * 25;
        break;
    }
  }
  return cap;
}

function getExperience(level: number): bigint {
  const lvl = BigInt(level);
  return (50n / 3n) * (lvl ** 3n - 6n * lvl ** 2n + 17n * lvl - 12n);
}

type PlayerInput = Pick<Player, "id" | "name" | "conditions"> & Partial<Player>;
type AccountInput = Pick<
  Account,
  "id" | "name" | "email" | "password" | "type"
>;
type TownInput = Pick<Town, "id" | "name"> & Partial<Town>;

function getPlayerData({
  id,
  name,
  level,
  vocation,
  sex,
  accountId,
  groupId,
  townId,
}: {
  id: number;
  name: string;
  level: number;
  vocation: Vocations;
  sex: Sex;
  accountId: number;
  groupId: GroupId;
  townId: number;
}): PlayerInput {
  const health = getHealth(level, vocation);
  const healthmax = health;
  const experience = getExperience(level);
  const mana = getMana(level, vocation);
  const manamax = mana;
  const cap = getCap(level, vocation);
  return {
    id,
    name,
    level,
    vocation,
    sex,
    accountId,
    groupId,
    health,
    healthmax,
    experience,
    mana,
    manamax,
    cap,
    lookbody: 113,
    lookfeet: 115,
    lookhead: 95,
    looklegs: 39,
    looktype: groupId === GroupId.God ? 75 : 129,
    conditions: Buffer.alloc(0),
    townId,
    lastlogin: BigInt(Math.floor(faker.date.past().getTime() / 1000)),
  };
}

let lastAccountId = 0;
let lastPlayerId = 0;
let lastTownId = 0;

const samplePlayers: PlayerInput[] = [
  getPlayerData({
    id: ++lastPlayerId,
    name: "Rook Sample",
    level: 1,
    vocation: Vocations.None,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
    townId: 1,
  }),
  getPlayerData({
    id: ++lastPlayerId,
    name: "Sorcerer Sample",
    level: 8,
    vocation: Vocations.Sorcerer,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
    townId: 1,
  }),
  getPlayerData({
    id: ++lastPlayerId,
    name: "Druid Sample",
    level: 8,
    vocation: Vocations.Druid,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
    townId: 1,
  }),
  getPlayerData({
    id: ++lastPlayerId,
    name: "Paladin Sample",
    level: 8,
    vocation: Vocations.Paladin,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
    townId: 1,
  }),
  getPlayerData({
    id: ++lastPlayerId,
    name: "Knight Sample",
    level: 8,
    vocation: Vocations.Knight,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
    townId: 1,
  }),
  getPlayerData({
    id: ++lastPlayerId,
    name: "God",
    level: 2,
    vocation: Vocations.None,
    sex: Sex.Female,
    accountId: 1,
    groupId: GroupId.God,
    townId: 1,
  }),
];

function generatePlayer(accountId: number) {
  const id = ++lastPlayerId;
  const name = faker.name.firstName();
  const level = faker.datatype.number({ min: 1, max: 400 });
  const vocation = faker.datatype.number({ min: 0, max: 8 }) as Vocations;
  const sex = faker.datatype.number({ min: 0, max: 1 }) as Sex;
  const groupId = GroupId.Player;
  const townId = faker.datatype.number({ min: 1, max: lastTownId });
  return getPlayerData({
    id,
    name,
    level,
    vocation,
    sex,
    accountId,
    groupId,
    townId,
  });
}

function generateAccount(): AccountInput {
  const name = faker.internet.userName();
  const email = faker.internet.email();
  const password = createHash("sha1")
    .update(faker.internet.password())
    .digest("hex");
  const id = ++lastAccountId;

  return {
    id,
    name,
    email,
    password,
    type: 1,
  };
}

function generateTown(): TownInput {
  const id = ++lastTownId;
  const name = faker.address.city();
  return { id, name };
}

async function seed() {
  const configs = [
    { config: "db_version", value: "24" },
    { config: "motd_hash", value: "" },
    { config: "motd_num", value: "0" },
    { config: "players_record", value: "0" },
  ];

  for (const config of configs) {
    await prisma.serverConfig.upsert({
      where: { config: config.config },
      create: config,
      update: config,
    });
  }

  console.log(`Adding 10 random towns... 🏘️`);
  for (let i = 0; i < 10; i++) {
    let town: TownInput;
    do {
      town = generateTown();
    } while (await prisma.town.findUnique({ where: { id: town.id } }));

    await prisma.town.upsert({
      where: { id: town.id },
      create: town,
      update: town,
    });
  }

  console.log(`Adding God Account... 🙏`);
  const godAccount = {
    id: 1,
    name: "god",
    email: "@god",
    password: "21298df8a3277357ee55b01df9530b535cf08ec1",
    type: 5,
  };
  await prisma.account.upsert({
    where: { id: ++lastAccountId },
    create: godAccount,
    update: godAccount,
  });

  for (const player of samplePlayers) {
    await prisma.player.upsert({
      where: { id: player.id },
      create: player,
      update: player,
    });
  }

  console.log(`Adding 10 random accounts... 🤖`);
  for (let i = 0; i < 10; i++) {
    const account = generateAccount();
    await prisma.account.upsert({
      where: { id: account.id },
      create: account,
      update: account,
    });
    console.log(`Adding 5 random players to ${account.name}... 🤖`);
    for (let j = 0; j < 5; j++) {
      let player: PlayerInput;
      while (true) {
        player = generatePlayer(account.id);
        const existingPlayer = await prisma.player.findFirst({
          where: { name: player.name },
        });
        if (!existingPlayer) break;
      }
      await prisma.player.upsert({
        where: { id: player.id },
        create: player,
        update: player,
      });
    }
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

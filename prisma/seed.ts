import type { Account, Player } from "@prisma/client";
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
        health += (level - 8) * 10;
        break;
      case Vocations.Knight:
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
        mana += (level - 8) * 30;
        break;
      case Vocations.Paladin:
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

function getPlayerData({
  id,
  name,
  level,
  vocation,
  sex,
  accountId,
  groupId,
}: {
  id: number;
  name: string;
  level: number;
  vocation: Vocations;
  sex: Sex;
  accountId: number;
  groupId: GroupId;
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
    account_id: accountId,
    group_id: groupId,
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
  };
}
const samplePlayers: PlayerInput[] = [
  getPlayerData({
    id: 1,
    name: "Rook Sample",
    level: 1,
    vocation: Vocations.None,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
  }),
  getPlayerData({
    id: 2,
    name: "Sorcerer Sample",
    level: 8,
    vocation: Vocations.Sorcerer,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
  }),
  getPlayerData({
    id: 3,
    name: "Druid Sample",
    level: 8,
    vocation: Vocations.Druid,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
  }),
  getPlayerData({
    id: 4,
    name: "Paladin Sample",
    level: 8,
    vocation: Vocations.Paladin,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
  }),
  getPlayerData({
    id: 5,
    name: "Knight Sample",
    level: 8,
    vocation: Vocations.Knight,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.Player,
  }),
  getPlayerData({
    id: 6,
    name: "God",
    level: 2,
    vocation: Vocations.None,
    sex: Sex.Male,
    accountId: 1,
    groupId: GroupId.God,
  }),
];

async function generatePlayer(accountId: number): Promise<PlayerInput> {
  const latestPlayer = await prisma.player.findFirst({
    orderBy: { id: "desc" },
  });
  const id = latestPlayer ? latestPlayer.id + 1 : 1;
  const name = faker.name.firstName();
  const level = faker.datatype.number({ min: 1, max: 400 });
  const vocation = faker.datatype.number({ min: 0, max: 4 }) as Vocations;
  const sex = faker.datatype.number({ min: 0, max: 1 }) as Sex;
  const groupId = GroupId.Player;
  return getPlayerData({
    id,
    name,
    level,
    vocation,
    sex,
    accountId,
    groupId,
  });
}

async function generateAccount(): Promise<AccountInput> {
  const name = faker.internet.userName();
  const email = faker.internet.email();
  const password = createHash("sha1")
    .update(faker.internet.password())
    .digest("hex");
  const lastAccount = await prisma.account.findFirst({
    orderBy: { id: "desc" },
  });
  const id = lastAccount ? lastAccount.id + 1 : 1;

  return {
    id,
    name,
    email,
    password,
    type: 1,
  };
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

  console.log(`Adding God Account... 🙏`);
  const godAccount = {
    id: 1,
    name: "god",
    email: "@god",
    password: "21298df8a3277357ee55b01df9530b535cf08ec1",
    type: 5,
  };
  await prisma.account.upsert({
    where: { id: 1 },
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
    const account = await generateAccount();
    await prisma.account.upsert({
      where: { id: account.id },
      create: account,
      update: account,
    });
    console.log(`Adding 5 random players to ${account.name}... 🤖`);
    for (let j = 0; j < 5; j++) {
      let player: PlayerInput;
      while (true) {
        player = await generatePlayer(account.id);
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

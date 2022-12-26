import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { getPlayers } from "~/models/player.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  let filter = {
    name: url.searchParams.get("name"),
    vocations: url.searchParams.getAll("vocation"),
    town: url.searchParams.get("residence"),
    genders: url.searchParams.getAll("sex"),
  };

  const players = await getPlayers(filter);

  if (
    players.length === 1 &&
    url.searchParams.get("name") === players[0].name
  ) {
    throw redirect(`/players/${players[0].name}`);
  }

  return json({ players });
}

export default function PlayersPage() {
  const { players } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-row">
      <main className="flex flex-col p-6 gap-4">
        <div className="w-48 font-bold">Name</div>
        <div className="flex flex-row gap-2">
          <Form method="get" action="/players">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                name="name"
                className="w-2/3 border border-gray-300 rounded-md px-4 py-1"
              />
              <button className="w-1/3 px-4 py-1 bg-blue-500 text-white rounded-md">
                Lookup
              </button>
            </div>
          </Form>
        </div>
        <div className="w-48 font-bold">Players</div>
        <div className="flex-1">
          <ul className="list-none list-inside">
            {players.map((player) => (
              <li key={player.id}>
                <Link to={`/players/${player.name}`}>
                  {player.name} | {player.vocation} | {player.level}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}

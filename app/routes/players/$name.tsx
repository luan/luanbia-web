import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getPlayerByName } from "~/models/player.server";

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.name, "name is required");
  const player = await getPlayerByName(params.name);
  if (!player) {
    throw new Response("Not Found", {
      status: 404,
    });
  }
  return json({ player });
}

function AttributeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-row gap-2">
      <div className="w-48 font-bold">{label}</div>
      <div className="flex-1">{value}</div>
    </div>
  );
}

export default function PlayerPage() {
  const { player } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <section className="flex flex-col">
        <h1 className="text-lg font-bold">Character Information</h1>
        <hr className="my-2" />
        <div className="flex flex-col">
          <AttributeRow label="Name" value={player.name} />
          <AttributeRow label="Level" value={player.level.toString()} />
          <AttributeRow label="Vocation" value={player.vocation} />
          <AttributeRow label="Sex" value={player.sex} />
          <AttributeRow label="Residence" value={player.residence} />
        </div>
      </section>
    </div>
  );
}

export function CatchBoundary() {
  const params = useParams();
  return (
    <div>
      <h2>
        Character with name <span className="font-bold">{params.name}</span> not
        found!
      </h2>
    </div>
  );
}

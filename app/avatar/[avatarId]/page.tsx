import { models } from "@/utils/model";
import AvatarPage from "./avatar-page";

export default async function Page({
  params,
}: {
  params: Promise<{ avatarId: string }>;
}) {
  const { avatarId } = await params;

  const model = models.find((model) => model.id === avatarId);

  return (
    <main className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="container max-w-full">
        <h1 className="mb-6 text-4xl font-bold">{model?.title}</h1>
        <p className="mb-4 max-w-2xl">{model?.desctiption}</p>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">Key Features</h2>
        <ul className="mb-4 list-inside list-disc space-y-1">
          {model?.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
      <AvatarPage avatarId={avatarId} />
    </main>
  );
}

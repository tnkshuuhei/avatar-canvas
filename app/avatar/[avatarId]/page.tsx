import { models } from "@/utils/model";
import AvatarPage from "./avatar-page";

export default async function Page({
  params,
}: {
  params: Promise<{ avatarId: string }>;
}) {
  const { avatarId } = await params;

  const model = models.find((model) => model.id === avatarId)?.model;
  return <AvatarPage avatarId={model!} />;
}

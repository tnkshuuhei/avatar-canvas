import { models } from "@/utils/model";
import AvatarPage from "./avatar-page";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ avatarId: string }>;
}) {
  const { avatarId } = await params;
  const model = models.find((model) => model.id === avatarId);
  return {
    title: model?.title,
    description: model?.desctiption,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ avatarId: string }>;
}) {
  const { avatarId } = await params;

  const model = models.find((model) => model.id === avatarId);

  return (
    <main className="min-h-screen w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 md:mb-6 tracking-tight">
            {model?.title}
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-3xl">
            {model?.desctiption}
          </p>

          <div className="my-4 md:my-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Key Features
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {model?.tags.map((tag) => (
                <li key={tag} className="flex items-start">
                  <span className="inline-block w-1 h-1 rounded-full bg-current mt-2 mr-2"></span>
                  <span>{tag}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`https://github.com/evalscience/deepgov-modelspec/blob/main/agents/${model?.id}/model-spec.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10 cursor-pointer"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">View Model Spec</span>
            </Button>
          </Link>
        </div>

        {/* Avatar Component */}
        <div className="mt-8 md:mt-16">
          <AvatarPage avatarId={avatarId} />
        </div>
      </div>
    </main>
  );
}

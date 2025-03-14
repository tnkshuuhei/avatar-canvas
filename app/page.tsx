import ProjectCard from "@/components/card-component";
import Link from "next/link";
import { models } from "@/utils/model";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col items-center sm:items-start">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12 text-center">
          Agents
        </h2>
        <div className="grid md:grid-cols-3 gap-4 items-center sm:items-start">
          {models.map((model) => (
            <Link href={`/avatar/${model.id}`} key={model.id}>
              <ProjectCard
                title={model.title}
                description={model.desctiption}
                image={model.image}
                tags={model.tags}
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

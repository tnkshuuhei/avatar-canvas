import ProjectCard from "@/components/card-component";
import Link from "next/link";
import { models } from "@/utils/model";

export default function Home() {
  return (
    <main className="flex flex-col sm:items-start items-center justify-items-center min-h-screen p-12 ">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-2 md:mb-8">
        DeepGov Agents
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
  );
}

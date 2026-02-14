import { Container } from './Container'

export const PageLoader = () => (
  <section className="bg-frame py-16 text-white">
    <Container>
      <div className="flex min-h-[35vh] items-center justify-center border border-white/15 bg-black/20">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-1 w-24 overflow-hidden bg-white/20">
            <div className="h-full w-1/2 animate-pulse bg-accent" />
          </div>
          <p className="caption text-white/60">Загрузка раздела...</p>
        </div>
      </div>
    </Container>
  </section>
)

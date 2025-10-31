# front-layout

Estructura:
- hooks: Hooks de uso general
- contexts: Contextos de uso general. Si el contexto es muy grande, seguir la siguiente estructura:
    - reducers
    - states
    - store
    - actions
- types: Todos los tipos e interfaces
- utilities: Caja de herramientas diversas
- lib: Lo usa shadcn
- components: Elementos UI reutilizables, sin ninguna lógica
    - ui: Los elementos más pequeños y de uso general (básicamente shadcn)
    - layout: headers, footers, etc.
    - composed: componentes más complejos que pueden usar varios elementos del folder ui (graficos, tablas, etc.)
- services: Aquí se llaman al backend; deben procesar errores y respuestas internamente y devolver objetos ya construidos para que el resto de la app no conozca URLs ni detalles del backend. Deben ser plug-and-play.
- features: Aquí se combinan componentes, hooks, contextos, servicios y todo: punto de unión entre UI y lógica
    - components: Donde se junta todo; se usan componentes de components/composes, components/ui, se crean nuevos si es necsario, se implementan servicios, hooks, etc.
    - hooks: Hooks internos (opcional)
    - context: Contextos de uso interno (opcional)
- app: Rutas; aquí se implementan los features
- public: Logos, iconos, etc.
- docs: Documentos de vibe-codeo


Lineamientos generales:
- shadcn para elementos de UI
- aggrid para tablas
- plotly para graficos
- lucide para iconos
- solo tailwind, la vida es demasiado bella como para escribir css
- usar props para todos los componentes
- mantener las responsabilidades aisladas para cada folder, en especial services y el backend. Ninguna otra seccion de la app deberia saber de la existencia de urls, backend, axios, fetch, etc. unica y exclusivamente services.
- una de las carpetas principales sera features, es donde converge y nace la verdadera magia
- usen contextos, los contextos son amigos
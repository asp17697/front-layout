# front-layout

Estructura:

-> hooks: Hooks de uso general
-> contexts: Contextos de uso general, si el contexto es muy grande seguir la siguiente estructura
    -> reducers
    -> states
    -> store
    -> actions
-> types: Todos los tipos e interfaces
-> utilities: Caja de herramientas diversas
-> lib: Lo usa shadcn
-> components: Elementos UI reutilizables, sin ninguna logica
    -> ui: Los elementos mas pequenios y de uso genera, basicamene shadcn
    -> layout: headers, footers, etc.
    -> composed: componentes mas complejos que pueden usar varios elementos del folder ui
-> services: Aca se mandan a llamar al backend, internamente debe procesar errores y procesar las respuestas, cada servicio debe regresar objetos ya construidos, de esta forma ninguna otra parte de la app se entera de como funciona el backend ni de urls ni nada. Los servicios deberian ser los mas plug-and-play posible
-> features: Aca se combinan los componentes, hook, contextos, servicios y todo. Es el punto de union entre componentes de UI y la logica
    -> components: aca es donde se junta todo; se toman componentes del folder components, se implementan los servicios, se pueden crear los componentes propios del feature, etc.
    -> hooks: hooks internos, no siempre son necesarios
    -> context: contextos de uso interno, tampoco es necesario siempre
-> app: rutas, aca se implementan los features
-> public: logos, iconos, etc.
-> docs: documentos de vibe-codeo


Lineamientos generales:
- shadcn para elementos de UI
- aggrid para tablas
- plotly para graficos
- lucide para iconos
- solo tailwind, la vida es demasiado bella como para escribir css
- usar props para todos los componentes
- mantener las responsabilidades aisladas para cada folder, en especial services y el backend. Ninguna otra seccion de la app deberia saber de la existencia de urls, backend, axios, fetch, unica y exclusivamente services.
- una de las carpetas principales sera features, es donde converge y nace la verdadera magia
- usen contextos, los contextos son amigos
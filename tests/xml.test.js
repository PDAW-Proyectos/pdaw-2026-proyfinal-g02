const {
    escapeXml,
    serializeResenaXml,
    serializeResenasXml,
} = require("../src/utils/xml");

describe("Utilidad de serialización XML", () => {
    describe("escapeXml", () => {
        test("escapa caracteres especiales XML (&, <, >, \", ')", () => {
            const entrada = `Rock & Roll <Live> "2026" 'Test'`;
            const resultado = escapeXml(entrada);

            expect(resultado).toBe(
                "Rock &amp; Roll &lt;Live&gt; &quot;2026&quot; &apos;Test&apos;",
            );
        });

        test("devuelve cadena vacía si el valor es null o undefined", () => {
            expect(escapeXml(null)).toBe("");
            expect(escapeXml(undefined)).toBe("");
        });
    });

    describe("serializeResenaXml", () => {
        test("serializa una reseña con canción y artistas en array", () => {
            const resena = {
                id: 10,
                idUsuario: 3,
                nombreAutor: "Martín",
                valoracionPropia: 5,
                fechaPublicado: "2026-11-19T12:00:00.000Z",
                descripcion: "Tremendo tema & producción",
                cancion: {
                    id: 999,
                    titulo: "Bohemian Rhapsody",
                    artistas: ["Queen", "Freddie Mercury"],
                    album: "A Night at the Opera",
                },
            };

            const xml = serializeResenaXml(resena);

            expect(xml).toContain('<resena id="10">');
            expect(xml).toContain("<idUsuario>3</idUsuario>");
            expect(xml).toContain("<nombreAutor>Martín</nombreAutor>");
            expect(xml).toContain("<valoracionPropia>5</valoracionPropia>");
            expect(xml).toContain("<descripcion>Tremendo tema &amp; producción</descripcion>");
            expect(xml).toContain('<cancion id="999">');
            expect(xml).toContain("<titulo>Bohemian Rhapsody</titulo>");
            expect(xml).toContain("<artistas>Queen, Freddie Mercury</artistas>");
            expect(xml).toContain("<album>A Night at the Opera</album>");
        });

        test("maneja reseña sin canción ni artistas definidos", () => {
            const resena = {
                id: 1,
                valoracionPropia: 4,
                descripcion: "Bien",
            };

            const xml = serializeResenaXml(resena);

            expect(xml).toContain('<resena id="1">');
            expect(xml).toContain('<cancion id="">');
            expect(xml).toContain("<artistas></artistas>");
        });
    });

    describe("serializeResenasXml", () => {
        test("envuelve múltiples reseñas en la raíz <resenas> con declaración XML", () => {
            const reseñas = [
                { id: 1, valoracionPropia: 5, descripcion: "Uno", cancion: { titulo: "Tema 1" } },
                { id: 2, valoracionPropia: 3, descripcion: "Dos", cancion: { titulo: "Tema 2" } },
            ];

            const xml = serializeResenasXml(reseñas);

            expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
            expect(xml).toContain("<resenas>");
            expect(xml).toContain("</resenas>");
            expect(xml).toContain('<resena id="1">');
            expect(xml).toContain('<resena id="2">');
        });

        test("soporta recibir un único objeto en vez de un array", () => {
            const xml = serializeResenasXml({
                id: 7,
                valoracionPropia: 4,
                descripcion: "Única",
                cancion: { titulo: "Solo" },
            });

            expect(xml).toContain("<resenas>");
            expect(xml).toContain('<resena id="7">');
            expect(xml).toContain("<titulo>Solo</titulo>");
        });
    });
});
import { useState, useRef, useEffect, useMemo } from "react";
import {
  BookOpen, Users, Layers, Globe2, Plus, X, ChevronDown, ChevronRight, ChevronLeft,
  StickyNote, PenLine, Trash2, GripVertical, Link2, Lock, ArrowLeft,
  Image as ImageIcon, Calendar as CalendarIcon, GitBranch, Download, MessageSquare,
  Bold, Italic, Underline, AlignJustify, Minus, EyeOff, Sun, Moon, Search, Info, BookMarked,
  MapPin, Skull, Crown, Mail, Star, Mountain, Waves, Ban, Check, AlertTriangle, Pencil,
  Library, Save, Ruler, ScrollText, PawPrint, PlusSquare, ZoomIn, ZoomOut, Landmark, Undo2, Quote, Highlighter, DoorOpen
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@400;600&family=Merriweather:wght@400;700&display=swap');`;

const uid = () => Math.random().toString(36).slice(2, 10);
const hash = (str) => (str || "?").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const REL_TYPES = {
  amistad: { label: "Amistad", color: "#C9A24B", closeness: "buena" },
  enemistad: { label: "Enemistad", color: "#FF3B30", closeness: "mala" },
  amor: { label: "Pareja / amor", color: "#C06E97", closeness: "buena" },
  familia: { label: "Familia (otro vínculo)", color: "#8AA85F", closeness: "buena" },
  padre: { label: "Es su padre/madre", color: "#1E6E4A", closeness: "buena" },
  hijo: { label: "Es su hijo/a", color: "#4FB8C9", closeness: "buena" },
  hermano: { label: "Es su hermano/a", color: "#B98CD9", closeness: "buena" },
  aliado: { label: "Aliado / socio", color: "#6E93C9", closeness: "buena" },
  guardia: { label: "Guardia / siervo de", color: "#9C8B5E", closeness: "buena" },
  mala_amistad: { label: "Mala amistad", color: "#A8683F", closeness: "mala" },
  mentor: { label: "Profesor / guía / maestro", color: "#4FA0A8", closeness: "buena" },
  protector: { label: "Protector", color: "#4F86A8", closeness: "buena" },
  companero: { label: "Compañero", color: "#D97F3D", closeness: "buena" },
};
const REL_RECIPROCAL = { guardia: "protector", padre: "hijo", hijo: "padre" };
const FAMILY_REL_KEYS = ["padre", "hijo", "hermano", "familia"];

const UNIVERSE_CATEGORIES = ["Lugares", "Reglas y magia", "Historia", "Facciones", "Religión / cultos", "Dioses", "Objetos", "Otros"];
const IMPORTANCE = ["Principal", "Secundario", "Ocasional"];
const NATURE_TYPES = ["Humano", "Sobrenatural", "Cercano a lo sobrenatural"];
const NATURE_SUBTYPES = ["Vampiro", "Hada/Fae", "Demonio", "Deidad", "Espíritu/Fantasma", "Bruja/Mago", "Metamorfo", "Elemental", "Elfo", "Cambiaformas", "Monstruo", "Ogro", "Orco", "Hombre lobo", "Sirena", "Oráculo", "Vidente", "Otro"];
const MILITARY_RANKS = ["Recluta", "Soldado", "Sargento", "Capitán", "Comandante", "General", "Gran Mariscal"];
const NOBLE_TITLES = ["Barón/esa", "Vizconde/sa", "Conde/sa", "Marqués/a", "Duque/sa", "Príncipe/sa", "Rey/Reina"];
const GENRES = ["Fantasía", "Romance", "Ciencia ficción", "Misterio", "Thriller", "Histórica", "Terror", "Drama", "Aventura", "Otro"];
const NARRATIVE_PERSON = ["Primera persona", "Segunda persona", "Tercera persona limitada", "Tercera persona omnisciente"];
const OBJECT_KINDS = ["Normal", "Arma", "Mágico", "Divino / de dioses"];
const STATUS = {
  sin_empezar: { label: "Sin empezar", color: "#8b8672" }, en_proceso: { label: "En proceso", color: "#6E93C9" }, borrador: { label: "Borrador", color: "#C9A24B" },
  finalizado: { label: "Finalizado", color: "#5FA98C" }, en_correccion: { label: "En corrección", color: "#C1594A" }, cancelado: { label: "Cancelado", color: "#5c5a53" },
};
const COLOR_PRESETS = ["#7c5cbf", "#b0479a", "#3d8a7a", "#C1594A", "#4F86A8", "#8AA85F", "#C9A24B", "#7A5EA8", "#4F7BB0", "#A8683F", "#E8C547", "#D97F3D", "#F5F3EB", "#8B8B85", "#2B2A27", "#4FB8C9", "#1F3A63", "#8C1F1F"];
const COLOR_NAMES = { "#E8C547": "Amarillo", "#D97F3D": "Naranja", "#F5F3EB": "Blanco", "#8B8B85": "Gris", "#2B2A27": "Negro", "#4FB8C9": "Cian", "#1F3A63": "Azul oscuro", "#8C1F1F": "Rojo fuerte" };
const HIGHLIGHTER_COLORS = ["rgba(246,226,122,0.35)", "rgba(246,169,169,0.35)", "rgba(169,216,246,0.35)", "rgba(185,240,176,0.35)", "rgba(227,185,240,0.35)", "rgba(246,201,138,0.35)"];

const EVENT_CATEGORIES = {
  politica_exterior: { label: "Política exterior", color: "#6E93C9" }, politica_interior: { label: "Política interior", color: "#4F7BB0" }, religioso: { label: "Religioso", color: "#C9A24B" },
  militar: { label: "Militar", color: "#C1594A" }, romance: { label: "Romance", color: "#C06E97" }, nacimiento: { label: "Nacimiento", color: "#5FA98C" }, concepcion: { label: "Concepción", color: "#E8A0C4" },
  muerte: { label: "Muerte", color: "#8a8a8a" }, magia_luz: { label: "Mágico (luz)", color: "#E3D28A" }, magia_oscura: { label: "Mágico (oscuridad)", color: "#7A5EA8" },
  mencion: { label: "Mención otro libro", color: "#77746a" }, secreto: { label: "Secreto", color: "#9b8fd6" }, aprendizaje: { label: "Aprendizaje", color: "#5C8AA0" },
};
const APPEARANCE_CATEGORIES = {
  militar: { label: "Militar", color: "#C1594A" }, nobleza: { label: "Nobleza", color: "#C9A24B" }, religion: { label: "Religión", color: "#E3D28A" },
  sobrenatural: { label: "Sobrenatural", color: "#7A5EA8" }, cercano: { label: "Cercano a lo sobrenatural", color: "#6E93C9" }, cultura: { label: "Cultura", color: "#5FA98C" },
};
const TENSION_LEVELS = [
  { level: 1, label: "Desarrollo de trama", desc: "Se construye el contexto, el mundo y las motivaciones. Ritmo tranquilo." },
  { level: 2, label: "Trama conflictiva", desc: "Aparecen los primeros obstáculos o roces entre personajes." },
  { level: 3, label: "Conflicto abierto", desc: "El problema central se enfrenta directamente, sin vuelta atrás." },
  { level: 4, label: "Cierre de capítulo impactante", desc: "Un giro, revelación o cliffhanger que golpea al lector." },
  { level: 5, label: "Locura / clímax", desc: "Punto de máxima tensión: todo se desborda." },
];
const LORE_TYPES = ["Magia/poderes", "Facción/grupo", "Religión/culto", "Leyenda/profecía", "Lugar/territorio", "Objeto/artefacto", "Tecnología/invento", "Otro"];
const BESTIARY_DANGER = ["Bajo", "Medio", "Alto", "Jefe"];
const BESTIARY_DANGER_COLOR = { Bajo: "#5FA98C", Medio: "#C9A24B", Alto: "#C1594A", Jefe: "#7A1F1F" };
const CORK_COLORS = ["#F5E6A8", "#F7C9C9", "#C9E4C5", "#C9DFF7", "#E4C9F7", "#F7E0C9"];
const CORK_SHAPES = ["rect", "circle", "cloud"];
const CORK_SIZES = { S: 110, M: 150, L: 200 };
const DECOR_ICONS = { vela: "🕯️", gato: "🐈", planta: "🪴", luna: "🌙" };
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];
const READER_COLORS = ["#5FA98C", "#6E93C9", "#C06E97", "#C9A24B", "#7A5EA8", "#4FA0A8", "#D97F3D", "#4FB8C9"];
const colorForReader = (name) => READER_COLORS[hash(name) % READER_COLORS.length];
const protagColor = (light) => (light ? "#D4A017" : "#FF3FA4");
const WORDS_PER_PAGE = 350;
const pageCount = (wc) => (wc <= 0 ? 0 : Math.ceil(wc / WORDS_PER_PAGE));
function actForOrder(order, acts) { const sorted = [...acts].sort((a, b) => a.startOrder - b.startOrder); let res = sorted[0]; for (const a of sorted) { if (a.startOrder <= order) res = a; else break; } return res; }
function rootPlaceId(id, places) { let cur = places.find((p) => p.id === id); const seen = new Set(); while (cur && cur.parentId && !seen.has(cur.id)) { seen.add(cur.id); const parent = places.find((p) => p.id === cur.parentId); if (!parent) break; cur = parent; } return cur ? cur.id : id; }

// ---------------- seed data ----------------
const seedUniverses = [{ id: "u1", name: "Mundo de Ébano" }];
const seedSagas = [
  { id: "s1", name: "Las Crónicas de Ébano", universeId: "u1", color: "#7A5EA8" },
  { id: "s2", name: "El Pacto de las Mareas", universeId: "u1", color: "#4F86A8" },
];
const seedBooks = [
  { id: "b1", sagaId: "s1", title: "El Susurro de las Cenizas", numberInSaga: 1, color: "#7c5cbf", cover: null, status: "en_proceso", genre: "Fantasía", subgenre: "Fantasía política", dateCreated: "2025-01-10", dateFinished: "", sinopsis: "Yren huye de la corte tras la caída de su casa.", narrators: "Yren Voss, Dain Ashworth", narrativePerson: "Tercera persona limitada", narrativeStartYear: 0, narrativeStartMonth: 1, narrativeStartDay: 1, narrativeEndYear: 0, narrativeEndMonth: 9, narrativeEndDay: 20 },
  { id: "b2", sagaId: "s1", title: "La Corona Rota", numberInSaga: 2, color: "#b0479a", cover: null, status: "sin_empezar", genre: "Fantasía", subgenre: "", dateCreated: "2025-06-01", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Tercera persona limitada", narrativeStartYear: 0, narrativeStartMonth: 7, narrativeStartDay: 1, narrativeEndYear: 1, narrativeEndMonth: 8, narrativeEndDay: 15 },
  { id: "b3", sagaId: null, title: "Donde Duermen los Faros", numberInSaga: null, color: "#3d8a7a", cover: null, status: "borrador", genre: "Drama", subgenre: "", dateCreated: "2025-03-02", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Primera persona", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
  { id: "b4", sagaId: "s2", title: "La Marea Negra", numberInSaga: 1, color: "#4F86A8", cover: null, status: "borrador", genre: "Aventura", subgenre: "", dateCreated: "2025-02-01", dateFinished: "", sinopsis: "Un contrabandista se ve envuelto en un pacto ancestral.", narrators: "", narrativePerson: "Tercera persona limitada", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
  { id: "b5", sagaId: "s2", title: "El Canto de las Profundidades", numberInSaga: 2, color: "#8AA85F", cover: null, status: "sin_empezar", genre: "Aventura", subgenre: "", dateCreated: "2025-04-01", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Tercera persona limitada", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
  { id: "b6", sagaId: null, title: "Cartas que Nunca Envié", numberInSaga: null, color: "#C9A24B", cover: null, status: "sin_empezar", genre: "Romance", subgenre: "", dateCreated: "2025-05-01", dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "Primera persona", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null },
];
const seedBookActs = {
  b1: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }, { id: "a2", name: "Acto 2", color: "#C9A24B", startOrder: 2 }, { id: "a3", name: "Acto 3", color: "#C1594A", startOrder: 4 }],
  b2: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }], b3: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }],
  b4: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }], b5: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }], b6: [{ id: "a1", name: "Acto 1", color: "#6E93C9", startOrder: 0 }],
};
const seedChapters = [
  { id: "ch1", bookId: "b1", title: "El puerto de sal", pov: "Yren Voss", brief: "Yren huye de la corte por mar.", tension: 2, order: 0, content: "Yren llegó al puerto antes del amanecer, cuando el olor a sal aún podía confundirse con el de la sangre. No miró atrás.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [{ id: uid(), color: "#C9A24B", theme: "Continuidad", excerpt: "olor a sal", markId: "m1", comment: "Recurrente: usarlo como leitmotiv." }], betaComments: [] },
  { id: "ch2", bookId: "b1", title: "La última carta", pov: "Dain Ashworth", brief: "Dain recibe noticias del frente.", tension: 3, order: 1, content: "La carta decía muy poco, pero lo que callaba pesaba más que lo escrito.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [{ id: uid(), reader: "Marta", comment: "Me encanta esta línea, ¡muy intrigante!", excerpt: "pesaba más que lo escrito", notified: false }] },
  { id: "ch3", bookId: "b1", title: "Cenizas en el viento", pov: "Yren Voss", brief: "El cerco se cierra sobre la ciudad.", tension: 4, order: 2, content: "El humo cubría la ciudad entera.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] },
  { id: "ch4", bookId: "b1", title: "El precio del silencio", pov: "Dain Ashworth", brief: "Dain descubre la traición.", tension: 3, order: 3, content: "Dain leyó el nombre dos veces antes de creerlo.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] },
  { id: "ch5", bookId: "b1", title: "La Ciudadela cae", pov: "Yren Voss", brief: "Enfrentamiento final del acto.", tension: 5, order: 4, content: "La sal blanca se tiñó de rojo esa noche.", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] },
];
const seedCharacters = [
  { id: "c1", sagaId: "s1", order: 0, name: "Yren Voss", nickname: "La Sombra del Puerto", customFamilyTag: "", photo: null, emblem: null, importance: "Principal", lineageGroup: "Casa Voss", powerLevel: 6, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "27", birthday: "03-14", birthplace: "Puerto Cendal", civilStatus: "Soltera", title: "Ex-dama de corte", occupation: "Espía", physicalHeight: "1.68", physicalDesc: "Cabello negro corto, cicatriz en la ceja izquierda.", role: "Protagonista", motivation: "Vengar a su hermano", virtues: "Lealtad, astucia", defects: "Desconfianza extrema, orgullo", weakness: "Perder el control", personality: "Reservada, calculadora, irónica", itemsCarried: "Daga de su hermano", importantItems: "Carta sellada del Canciller", hobbies: "Ajedrez, tallar madera", trivia: "Nunca duerme dos noches en la misma habitación", statusByBook: { b1: "Recién huida de la corte, desconfía de todos.", b2: "Al mando de la resistencia, endurecida por la guerra." }, roleByBook: { b1: "Protagonista", b2: "Protagonista" }, relationships: [{ id: uid(), targetId: "c2", type: "amor", note: "Se conocieron en el exilio" }, { id: uid(), targetId: "c2", type: "companero", note: "Luchan juntas la resistencia" }, { id: uid(), targetId: "c3", type: "enemistad", note: "Mató a su hermano" }, { id: uid(), targetId: "c4", type: "hijo", note: "" }, { id: uid(), targetId: "c6", type: "hermano", note: "" }] },
  { id: "c2", sagaId: "s1", order: 1, name: "Dain Ashworth", nickname: "El Comandante Gris", customFamilyTag: "", photo: null, emblem: null, importance: "Principal", lineageGroup: "Casa Ashworth", powerLevel: 6, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: true, militaryRank: "Comandante", isNoble: true, nobleTitle: "Vizconde/sa", isDead: false, deathBookId: "", deathNote: "", age: "30", birthday: "07-02", birthplace: "Ciudadela de Sal", civilStatus: "Soltero", title: "Comandante exiliado", occupation: "Militar", physicalHeight: "1.85", physicalDesc: "Complexión fuerte, cicatriz en el antebrazo.", role: "Protagonista", motivation: "Restaurar el reino a su pueblo", virtues: "Valentía, empatía", defects: "Impulsividad", weakness: "Repetir los errores de su padre", personality: "Idealista, cálido, directo", itemsCarried: "Espada de su padre", importantItems: "", hobbies: "Cabalgar", trivia: "", statusByBook: { b1: "Comandante exiliado, aún cree en Yren.", b2: "Roto por la guerra, pero sigue a su lado." }, roleByBook: { b1: "Protagonista", b2: "Secundario" }, relationships: [{ id: uid(), targetId: "c1", type: "amor", note: "" }, { id: uid(), targetId: "c1", type: "companero", note: "" }, { id: uid(), targetId: "c3", type: "aliado", note: "Antiguos hermanos de armas, ahora enfrentados" }, { id: uid(), targetId: "c4", type: "hijo", note: "" }, { id: uid(), targetId: "c5", type: "hermano", note: "" }] },
  { id: "c3", sagaId: "s1", order: 2, name: "Canciller Rhoswen", nickname: "", customFamilyTag: "", photo: null, emblem: null, importance: "Secundario", lineageGroup: "", powerLevel: 9, natureType: "Sobrenatural", natureSubtype: "Otro", natureSubtypeOther: "Ser inmortal ligado a un juramento", natureEffect: "No envejece; pierde poder si miente.", isMilitary: false, militaryRank: "", isNoble: true, nobleTitle: "Duque/sa", isDead: true, deathBookId: "b1", deathNote: "Muere al final del Acto 3.", age: "58 (aparenta 40)", birthday: "11-30", birthplace: "Desconocido", civilStatus: "Viudo", title: "Canciller", occupation: "Gobierno", physicalHeight: "1.78", physicalDesc: "Porte rígido, ojos grises.", role: "Antagonista", motivation: "Orden a cualquier precio", virtues: "Disciplina", defects: "Frialdad", weakness: "El caos", personality: "Frío, meticuloso, se cree justo", itemsCarried: "Anillo de sello", importantItems: "El Silencio (juramento)", hobbies: "", trivia: "", statusByBook: { b1: "En la sombra, moviendo hilos.", b2: "Al descubierto, acorralado." }, roleByBook: { b1: "Antagonista", b2: "Antagonista" }, relationships: [{ id: uid(), targetId: "c1", type: "enemistad", note: "" }] },
  { id: "c4", sagaId: "s1", order: 3, name: "Elara Voss-Ashworth", nickname: "La Pequeña Ceniza", customFamilyTag: "", photo: null, emblem: null, importance: "Ocasional", lineageGroup: "Casa Voss", powerLevel: 2, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "3", birthday: "01-05", birthplace: "Bosque de Ceniza", civilStatus: "-", title: "", occupation: "", physicalHeight: "0.95", physicalDesc: "Ojos grises como su padre.", role: "Hija de los protagonistas", motivation: "", virtues: "", defects: "", weakness: "", personality: "Curiosa", itemsCarried: "", importantItems: "", hobbies: "", trivia: "", statusByBook: { b2: "Crece escondida en el campamento de la resistencia." }, roleByBook: {}, relationships: [{ id: uid(), targetId: "c1", type: "padre", note: "" }, { id: uid(), targetId: "c2", type: "padre", note: "" }] },
  { id: "c5", sagaId: "s1", order: 4, name: "Bram Ashworth", nickname: "", customFamilyTag: "", photo: null, emblem: null, importance: "Ocasional", lineageGroup: "Casa Ashworth", powerLevel: 4, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: true, militaryRank: "Capitán", isNoble: true, nobleTitle: "Vizconde/sa", isDead: false, deathBookId: "", deathNote: "", age: "26", birthday: "09-18", birthplace: "Ciudadela de Sal", civilStatus: "Soltero", title: "Capitán de la guardia", occupation: "Militar", physicalHeight: "1.79", physicalDesc: "Más delgado que su hermano.", role: "Hermano menor de Dain", motivation: "Demostrar su valía", virtues: "Lealtad", defects: "Envidia", weakness: "Comparación con Dain", personality: "Ambicioso, reservado", itemsCarried: "", importantItems: "", hobbies: "", trivia: "", statusByBook: { b1: "Sirve todavía al Canciller." }, roleByBook: { b1: "Secundario" }, relationships: [{ id: uid(), targetId: "c2", type: "hermano", note: "" }] },
  { id: "c6", sagaId: "s1", order: 5, name: "Sera Voss", nickname: "La Callada", customFamilyTag: "", photo: null, emblem: null, importance: "Secundario", lineageGroup: "Casa Voss", powerLevel: 4, natureType: "Cercano a lo sobrenatural", natureSubtype: "", natureSubtypeOther: "", natureEffect: "Sueña fragmentos del futuro.", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "24", birthday: "05-22", birthplace: "Puerto Cendal", civilStatus: "Soltera", title: "", occupation: "Curandera", physicalHeight: "1.63", physicalDesc: "Idéntica a Yren, pero con los ojos claros.", role: "Hermana de Yren", motivation: "Proteger a su hermana", virtues: "Paciencia", defects: "Se guarda secretos", weakness: "Sus visiones la debilitan", personality: "Serena, observadora", itemsCarried: "", importantItems: "", hobbies: "Herboristería", trivia: "", statusByBook: { b1: "Se queda en Puerto Cendal, oculta." }, roleByBook: { b1: "Secundario" }, relationships: [{ id: uid(), targetId: "c1", type: "hermano", note: "" }] },
];
const seedUniverseEntries = [
  { id: "pl1", sagaId: "s1", category: "Lugares", title: "La Ciudadela de Sal", content: "Fortaleza tallada en un acantilado de sal blanca. Sede del Canciller.", tags: ["fortaleza"], parentId: null, localX: 50, localY: 50, north: 8, south: 2, east: 6, west: 4, nearRiver: false, nearSea: true, nearMountain: true, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: true, isImportantCourt: true, isIsland: false, kingdomName: "" },
  { id: "pl2", sagaId: "s1", category: "Lugares", title: "Puerto Cendal", content: "Puerto comercial al sur del reino, punto de fuga de Yren.", tags: [], parentId: null, localX: 50, localY: 50, north: 2, south: 9, east: 5, west: 5, nearRiver: false, nearSea: true, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl2a", sagaId: "s1", category: "Lugares", title: "Muelle Viejo", content: "Zona portuaria donde atracan los barcos de contrabando.", tags: [], parentId: "pl2", localX: 30, localY: 40, north: 0, south: 0, east: 0, west: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl2b", sagaId: "s1", category: "Lugares", title: "Mercado de Especias", content: "El corazón comercial de Puerto Cendal.", tags: [], parentId: "pl2", localX: 65, localY: 55, north: 0, south: 0, east: 0, west: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl2a1", sagaId: "s1", category: "Lugares", title: "Taberna La Sirena Rota", content: "Punto de encuentro de espías y contrabandistas.", tags: [], parentId: "pl2a", localX: 50, localY: 50, north: 0, south: 0, east: 0, west: 0, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl3", sagaId: "s1", category: "Lugares", title: "Bosque de Ceniza", content: "Bosque quemado tras la Guerra del Silencio, refugio de la resistencia.", tags: ["refugio"], parentId: null, localX: 50, localY: 50, north: 5, south: 5, east: 2, west: 8, nearRiver: true, nearSea: false, nearMountain: false, nearLake: true, nearVolcano: false, nearCamp: true, isSupernatural: true, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl4", sagaId: "s1", category: "Lugares", title: "Ciudad de Cendal (corte)", content: "Capital del reino, sede de la antigua corte de Yren.", tags: [], parentId: null, localX: 50, localY: 50, north: 5, south: 5, east: 5, west: 5, nearRiver: true, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: true, isImportantCourt: true, isIsland: false, kingdomName: "" },
  { id: "pl5", sagaId: "s1", category: "Lugares", title: "Paso de Hierro", content: "Frontera montañosa con el reino vecino.", tags: [], parentId: null, localX: 50, localY: 50, north: 9, south: 1, east: 8, west: 2, nearRiver: false, nearSea: false, nearMountain: true, nearLake: false, nearVolcano: true, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" },
  { id: "pl6", sagaId: "s1", category: "Lugares", title: "Islas Grises", content: "Archipiélago al otro lado del mar, fuera del reino.", tags: ["exterior"], parentId: null, localX: 50, localY: 50, north: 3, south: 7, east: 18, west: 1, nearRiver: false, nearSea: true, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: true, kingdomName: "Reino de las Mareas" },
  { id: "rc1", sagaId: "s1", category: "Religión / cultos", title: "El Culto del Silencio", content: "Orden religiosa que venera el juramento como forma de poder.", tags: [] },
  { id: "dg1", sagaId: "s1", category: "Dioses", title: "Vessa, la que Calla", content: "Diosa del secreto y las promesas.", domain: "Secretos, juramentos, silencio", symbol: "Una llave sin cerradura", personality: "Justa pero implacable con quien rompe su palabra", image: null, tags: [] },
  { id: "ob1", sagaId: "s1", category: "Objetos", title: "El Silencio (juramento)", content: "Reliquia que ata el poder del Canciller a su palabra.", objectKind: "Mágico", image: null, tags: [] },
];
const seedEvents = [
  { id: uid(), sagaId: "s1", title: "Caída de la corte de Cendal", category: "politica_interior", month: 3, day: 12, continuous: false, annual: false },
  { id: uid(), sagaId: "s1", title: "Guerra del Silencio", category: "militar", month: 5, day: 1, continuous: true, annual: false },
  { id: uid(), sagaId: "s1", title: "Festival de las Cenizas", category: "religioso", month: 3, day: 20, continuous: false, annual: true },
  { id: uid(), sagaId: "s1", title: "Concepción de Elara", category: "concepcion", month: 4, day: 2, continuous: false, annual: false },
  { id: uid(), sagaId: "s1", title: "Muerte del Canciller Rhoswen", category: "muerte", month: 9, day: 30, continuous: false, annual: false },
];
const seedAppearances = [
  { id: uid(), sagaId: "s1", characterId: "c1", chapterId: "ch1", category: "cercano" },
  { id: uid(), sagaId: "s1", characterId: "c2", chapterId: "ch2", category: "militar" },
];
const seedStoryEvents = [
  { id: uid(), sagaId: "s1", order: 0, yearOffset: 0, month: 3, day: 12, category: "politica_interior", title: "Caída de la corte de Cendal", description: "El Canciller Rhoswen orquesta el golpe que expulsa a la Casa Voss de la corte.", highlightFor: ["c1"] },
  { id: uid(), sagaId: "s1", order: 1, yearOffset: 0, month: 6, day: 1, category: "militar", title: "Estalla la Guerra del Silencio", description: "El reino se divide entre los leales al Canciller y la resistencia liderada por Dain.", highlightFor: ["c2"] },
  { id: uid(), sagaId: "s1", order: 2, yearOffset: 1, month: 8, day: 4, category: "nacimiento", title: "Nace Elara", description: "En el Bosque de Ceniza, escondida de la guerra.", highlightFor: ["c1", "c2", "c4"] },
  { id: uid(), sagaId: "s1", order: 3, yearOffset: 2, month: 3, day: 30, category: "muerte", title: "Cae la Ciudadela de Sal", description: "El Canciller Rhoswen muere en el asedio final.", highlightFor: ["c3"] },
];
const seedLocations = [
  { id: uid(), sagaId: "s1", chapterId: "ch1", characterId: "c1", placeId: "pl2" },
  { id: uid(), sagaId: "s1", chapterId: "ch1", characterId: "c2", placeId: "pl4" },
  { id: uid(), sagaId: "s1", chapterId: "ch2", characterId: "c2", placeId: "pl4" },
  { id: uid(), sagaId: "s1", chapterId: "ch3", characterId: "c1", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch3", characterId: "c3", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch4", characterId: "c2", placeId: "pl3" },
  { id: uid(), sagaId: "s1", chapterId: "ch5", characterId: "c1", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch5", characterId: "c2", placeId: "pl1" },
  { id: uid(), sagaId: "s1", chapterId: "ch5", characterId: "c3", placeId: "pl1" },
];
const seedEraConfig = { s1: { startYear: 389, suffix: "a.f.s" } };
const seedBorders = { s1: [{ id: "fr1", name: "Reino de Ébano", color: "#C9A24B", points: [[30,20],[70,15],[85,45],[75,80],[40,88],[15,55]] }] };
const seedLore = [
  { id: uid(), sagaId: "s1", title: "El Silencio", kind: "Magia/poderes", description: "Forma de magia basada en juramentos: cada promesa rota drena poder de quien la hizo.", fn: "Sella pactos vinculantes", inventor: "Desconocido, atribuido a Vessa", materials: "Sangre y palabra", era: "Desde la Era de Ceniza" },
  { id: uid(), sagaId: "s1", title: "La Resistencia de Ceniza", kind: "Facción/grupo", description: "Grupo rebelde liderado por Dain Ashworth tras la caída de la corte.", fn: "Oponerse al Canciller", inventor: "", materials: "", era: "Año 1 en adelante" },
];
const seedBestiary = [
  { id: uid(), sagaId: "s1", name: "Lobo de Ceniza", species: "Bestia mágica / lobo", danger: "Medio", image: null, description: "Lobo con pelaje gris ceniza, caza en manadas cerca del Bosque de Ceniza. Sensible al fuego." },
  { id: uid(), sagaId: "s1", name: "El Silente", species: "Espíritu / guardián", danger: "Jefe", image: null, description: "Guardián invocado por el juramento del Canciller. Solo puede ser dañado por quien haya roto una promesa." },
];
const seedCork = { b1: [{ id: uid(), text: "Recordar: el color de ojos de Sera cambia según sus visiones.", color: "#F5E6A8", x: 40, y: 30, shape: "rect", size: "M", z: 1 }, { id: uid(), text: "Revisar ritmo del Acto 2 — ¿demasiado lento?", color: "#F7C9C9", x: 260, y: 70, shape: "circle", size: "M", z: 2 }] };
const seedIdeas = [
  { id: uid(), sagaId: "s1", text: "A Dain le viene un recuerdo sobre ropa rota cuando escucha música.", characterId: "c2", bookId: "b1", actId: "a2" },
  { id: uid(), sagaId: "s1", text: "\"El silencio también es una forma de mentir.\" — posible línea para Yren.", characterId: "c1", bookId: "", actId: "" },
];
const seedSurveys = [];

function useInjectedFont() {
  useEffect(() => { const style = document.createElement("style"); style.textContent = FONT_IMPORT + `.no-select{-webkit-user-select:none;user-select:none;}`; document.head.appendChild(style); return () => document.head.removeChild(style); }, []);
}
function useIsMobile() { const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 860 : false); useEffect(() => { const fn = () => setMobile(window.innerWidth < 860); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []); return mobile; }
function fileToDataUrl(file, cb) { const reader = new FileReader(); reader.onload = () => cb(reader.result); reader.readAsDataURL(file); }
function wordCount(html) { const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim(); return text ? text.split(/\s+/).length : 0; }
function activityWithDates(seed) { const data = []; let s = hash(seed); const today = new Date(); for (let i = 0; i < 52 * 7; i++) { s = (s * 1103515245 + 12345) >>> 0; const level = s % 6 < 3 ? 0 : (s % 5); const d = new Date(today); d.setDate(d.getDate() - (52 * 7 - 1 - i)); data.push({ level, date: d }); } return data; }
const DATE_FMT = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });
function pointInPolygon(pt, poly) { let inside = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; const intersect = ((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi); if (intersect) inside = !inside; } return inside; }

const DARK = { bg: "#15161d", bg2: "#191a22", bg3: "#101117", border: "#282a38", text: "#EDE9DD", dim: "#77746a", accent: "#C9A24B", accentText: "#1c1712" };
const LIGHT = { bg: "#FAF6EC", bg2: "#FFFFFF", bg3: "#F1EBDC", border: "#E1D9C5", text: "#2B2A25", dim: "#948F79", accent: "#3E6FA8", accentText: "#FFFFFF" };

export default function AtelierNarrativo() {
  useInjectedFont();
  const isMobile = useIsMobile();
  const [light, setLight] = useState(false);
  const T = light ? LIGHT : DARK;
  const authorName = "Ana Bramell";

  const [universes, setUniverses] = useState(seedUniverses);
  const [sagas, setSagas] = useState(seedSagas);
  const [books, setBooks] = useState(seedBooks);
  const [bookActs, setBookActs] = useState(seedBookActs);
  const [chapters, setChapters] = useState(seedChapters);
  const [characters, setCharacters] = useState(seedCharacters);
  const [universeEntries, setUniverseEntries] = useState(seedUniverseEntries);
  const [events, setEvents] = useState(seedEvents);
  const [appearances, setAppearances] = useState(seedAppearances);
  const [storyEvents, setStoryEvents] = useState(seedStoryEvents);
  const [locations, setLocations] = useState(seedLocations);
  const [eraConfig, setEraConfig] = useState(seedEraConfig);
  const [borders, setBorders] = useState(seedBorders);
  const [loreEntries, setLoreEntries] = useState(seedLore);
  const [bestiary, setBestiary] = useState(seedBestiary);
  const [corkNotes, setCorkNotes] = useState(seedCork);
  const [ideas, setIdeas] = useState(seedIdeas);
  const [surveys, setSurveys] = useState(seedSurveys);
  const [relPositions, setRelPositions] = useState({}); // sagaId -> {charId:{x,y}}
  const [shelfLayout, setShelfLayout] = useState({}); // bookId -> {shelf,x,y}
  const [shelfDecor, setShelfDecor] = useState([]); // {id,kind,x,y}
  const [lastEditedBookId, setLastEditedBookId] = useState(null);

  const [view, setView] = useState("library");
  const [currentBookId, setCurrentBookId] = useState(null);
  const [tab, setTab] = useState("capitulos");

  const currentBook = books.find((b) => b.id === currentBookId);
  const bookSagaId = currentBook?.sagaId ?? null;
  const scopeId = bookSagaId || currentBookId;
  const scopeBooks = bookSagaId ? books.filter((b) => b.sagaId === bookSagaId) : books.filter((b) => b.id === currentBookId);

  function openBook(id) { setCurrentBookId(id); setTab("capitulos"); setView("book"); setLastEditedBookId(id); }
  function addUniverse() { const name = prompt("Nombre del universo:"); if (name) setUniverses((u) => [...u, { id: uid(), name }]); }
  function addSaga(universeId) {
    const name = prompt("Nombre de la saga:"); if (!name) return;
    if (universeId) { const siblings = sagas.filter((s) => s.universeId === universeId); if (siblings.length > 0) { const share = confirm(`Este universo ya tiene otras sagas.\n\n¿Quieres que "${name}" comparta personajes con las sagas existentes de este universo? (Aceptar = compartir, Cancelar = mantenerla independiente)`); setSagas((s) => [...s, { id: uid(), name, universeId, color: null, sharesWith: share ? siblings.map((x) => x.id) : [] }]); return; } }
    setSagas((s) => [...s, { id: uid(), name, universeId: universeId || null, color: null, sharesWith: [] }]);
  }
  function addBook(sagaId) {
    const title = prompt("Título del libro:"); if (!title) return;
    const n = books.filter((b) => b.sagaId === sagaId).length + 1;
    const nb = { id: uid(), sagaId, title, numberInSaga: sagaId ? n : null, color: COLOR_PRESETS[books.length % COLOR_PRESETS.length], cover: null, status: "sin_empezar", genre: "", subgenre: "", dateCreated: new Date().toISOString().slice(0, 10), dateFinished: "", sinopsis: "", narrators: "", narrativePerson: "", narrativeStartYear: null, narrativeStartMonth: null, narrativeStartDay: null, narrativeEndYear: null, narrativeEndMonth: null, narrativeEndDay: null };
    setBooks((b) => [...b, nb]);
    setBookActs((a) => ({ ...a, [nb.id]: [{ id: uid(), name: "Acto 1", color: "#6E93C9", startOrder: 0 }] }));
    openBook(nb.id);
  }
  function deleteSagaCascade(sagaId, deleteBooksToo) {
    const sagaBookIds = books.filter((b) => b.sagaId === sagaId).map((b) => b.id);
    if (deleteBooksToo) { setBooks((b) => b.filter((x) => x.sagaId !== sagaId)); setChapters((c) => c.filter((x) => !sagaBookIds.includes(x.bookId))); }
    else setBooks((b) => b.map((x) => (x.sagaId === sagaId ? { ...x, sagaId: null, numberInSaga: null } : x)));
    setSagas((s) => s.filter((x) => x.id !== sagaId));
    setCharacters((c) => c.filter((x) => x.sagaId !== sagaId));
    setUniverseEntries((u) => u.filter((x) => x.sagaId !== sagaId));
    setEvents((e) => e.filter((x) => x.sagaId !== sagaId));
    setAppearances((a) => a.filter((x) => x.sagaId !== sagaId));
    setStoryEvents((s) => s.filter((x) => x.sagaId !== sagaId));
    setLocations((l) => l.filter((x) => x.sagaId !== sagaId));
    setLoreEntries((l) => l.filter((x) => x.sagaId !== sagaId));
    setBestiary((b) => b.filter((x) => x.sagaId !== sagaId));
    setIdeas((i) => i.filter((x) => x.sagaId !== sagaId));
  }
  function deleteUniverseCascade(universeId, deleteEverything) {
    const uSagas = sagas.filter((s) => s.universeId === universeId).map((s) => s.id);
    if (deleteEverything) uSagas.forEach((sid) => deleteSagaCascade(sid, true)); else setSagas((s) => s.map((x) => (x.universeId === universeId ? { ...x, universeId: null } : x)));
    setUniverses((u) => u.filter((x) => x.id !== universeId));
  }

  const snapshotRef = useRef(""); const lastSavedAtRef = useRef(Date.now());
  const [dirty, setDirty] = useState(false); const [savedFlash, setSavedFlash] = useState(false);
  const allState = { universes, sagas, books, bookActs, chapters, characters, universeEntries, events, appearances, storyEvents, locations, eraConfig, borders, loreEntries, bestiary, corkNotes, ideas, surveys };
  useEffect(() => { const snap = JSON.stringify(allState); if (snapshotRef.current === "") snapshotRef.current = snap; else if (snap !== snapshotRef.current) setDirty(true); });
  useEffect(() => { const timer = setInterval(() => { if (dirty && Date.now() - lastSavedAtRef.current > 15 * 60 * 1000) saveNow(); }, 30000); return () => clearInterval(timer); }, [dirty]); // eslint-disable-line
  function saveNow() { snapshotRef.current = JSON.stringify(allState); lastSavedAtRef.current = Date.now(); setDirty(false); setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2500); }

  const pendingBeta = useMemo(() => { const list = []; chapters.forEach((c) => (c.betaComments || []).forEach((bc) => { if (!bc.notified) { const book = books.find((b) => b.id === c.bookId); list.push({ reader: bc.reader, chapter: c.title, book: book?.title || "" }); } })); return list; }, []); // eslint-disable-line
  const [showBetaNotice, setShowBetaNotice] = useState(pendingBeta.length > 0);
  function dismissBetaNotice() { setChapters((cs) => cs.map((c) => ({ ...c, betaComments: (c.betaComments || []).map((bc) => ({ ...bc, notified: true })) }))); setShowBetaNotice(false); }

  const headerControls = <SaveControl dirty={dirty} savedFlash={savedFlash} onSave={saveNow} light={light} setLight={setLight} />;

  return (
    <div style={{ "--bg": T.bg, "--bg2": T.bg2, "--bg3": T.bg3, "--border": T.border, "--text": T.text, "--dim": T.dim, "--accent": T.accent, "--accentText": T.accentText, "--protag": protagColor(light), fontFamily: "'Inter', sans-serif", background: "var(--bg)", color: "var(--text)", minHeight: "640px", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
      {showBetaNotice && (
        <Modal onClose={dismissBetaNotice}>
          <div style={{ width: 340, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><MessageSquare size={16} color="var(--accent)" /> Nuevos comentarios de beta lectores</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>{pendingBeta.map((p, i) => <div key={i} style={{ fontSize: 13, color: "var(--text)", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}><b style={{ color: colorForReader(p.reader) }}>{p.reader}</b> ha comentado en <b>{p.chapter}</b>{p.book ? ` de "${p.book}"` : ""}.</div>)}</div>
            <button onClick={dismissBetaNotice} style={primaryBtn}>Cerrar</button>
          </div>
        </Modal>
      )}
      {view === "library" ? (
        <LibraryScreen universes={universes} sagas={sagas} setSagas={setSagas} books={books} setBooks={setBooks} setUniverses={setUniverses} openBook={openBook} addUniverse={addUniverse} addSaga={addSaga} addBook={addBook} deleteSagaCascade={deleteSagaCascade} deleteUniverseCascade={deleteUniverseCascade} authorName={authorName} onOpenShelf={() => setView("shelf")} headerControls={headerControls} isMobile={isMobile} lastEditedBookId={lastEditedBookId} />
      ) : view === "shelf" ? (
        <ShelfLibrary books={books} sagas={sagas} onBack={() => setView("library")} onOpenBook={openBook} isMobile={isMobile} layout={shelfLayout} setLayout={setShelfLayout} decor={shelfDecor} setDecor={setShelfDecor} lastEditedBookId={lastEditedBookId} />
      ) : (
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, order: isMobile ? 1 : 0 }}>
            <BookTopBar book={currentBook} onBack={() => setView("library")} headerControls={headerControls} />
            <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "14px 14px" : "20px 28px" }}>
              {tab === "capitulos" && <ChaptersTab bookId={currentBookId} chapters={chapters} setChapters={setChapters} bookActs={bookActs[currentBookId] || []} setBookActs={setBookActs} isMobile={isMobile} />}
              {tab === "personajes" && <CharactersTab sagaId={scopeId} bookId={currentBookId} books={scopeBooks} bookActs={bookActs} characters={characters} setCharacters={setCharacters} ideas={ideas} setIdeas={setIdeas} light={light} relPositions={relPositions[scopeId] || {}} setRelPositions={(pos) => setRelPositions((r) => ({ ...r, [scopeId]: pos }))} />}
              {tab === "estructura" && <StructureTab bookId={currentBookId} chapters={chapters} setChapters={setChapters} bookActs={bookActs} setBookActs={setBookActs} />}
              {tab === "calendario" && <CalendarTab sagaId={scopeId} characters={characters} events={events} setEvents={setEvents} />}
              {tab === "aparicion" && <AppearanceTab sagaId={scopeId} books={scopeBooks} chapters={chapters} characters={characters} appearances={appearances} setAppearances={setAppearances} />}
              {tab === "linea" && <StoryTimelineTab sagaId={scopeId} books={scopeBooks} setBooks={setBooks} storyEvents={storyEvents} setStoryEvents={setStoryEvents} characters={characters.filter((c) => c.sagaId === scopeId)} eraConfig={eraConfig[scopeId]} setEraConfig={(patch) => setEraConfig((e) => ({ ...e, [scopeId]: { ...(e[scopeId] || { startYear: 0, suffix: "" }), ...patch } }))} />}
              {tab === "localizacion" && <LocationTab sagaId={scopeId} books={scopeBooks} chapters={chapters} characters={characters.filter((c) => c.sagaId === scopeId)} universeEntries={universeEntries} setUniverseEntries={setUniverseEntries} locations={locations} setLocations={setLocations} borders={borders[scopeId] || []} setBorders={(list) => setBorders((f) => ({ ...f, [scopeId]: list }))} />}
              {tab === "universo" && <UniverseTab sagaId={scopeId} universeEntries={universeEntries} setUniverseEntries={setUniverseEntries} />}
              {tab === "lore" && <LoreTab sagaId={scopeId} loreEntries={loreEntries} setLoreEntries={setLoreEntries} bestiary={bestiary} setBestiary={setBestiary} />}
              {tab === "pizarra" && <CorkboardTab bookId={currentBookId} corkNotes={corkNotes} setCorkNotes={setCorkNotes} />}
              {tab === "exportar" && <ExportTab book={currentBook} chapters={chapters.filter((c) => c.bookId === currentBookId)} characters={characters.filter((c) => c.sagaId === scopeId)} universeEntries={universeEntries.filter((u) => u.sagaId === scopeId)} bookActs={bookActs[currentBookId] || []} />}
              {tab === "beta" && <BetaReaderTab bookId={currentBookId} chapters={chapters.filter((c) => c.bookId === currentBookId)} setChapters={setChapters} surveys={surveys} setSurveys={setSurveys} />}
            </div>
          </div>
          <VerticalTabs tab={tab} setTab={setTab} isMobile={isMobile} />
        </div>
      )}
    </div>
  );
}

function SaveControl({ dirty, savedFlash, onSave, light, setLight }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 8 }}>{savedFlash && <span style={{ fontSize: 11, color: "#5FA98C" }}>Biblioteca guardada</span>}<button onClick={onSave} style={{ ...smallOutlineBtn, ...(dirty ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}) }} title="Guardar cambios ahora"><Save size={13} /> Guardar</button><button onClick={() => setLight((v) => !v)} style={smallOutlineBtn}>{light ? <Moon size={13} /> : <Sun size={13} />}</button></div>);
}

function VerticalTabs({ tab, setTab, isMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const items = [
    { id: "capitulos", label: "Capítulos", icon: BookOpen }, { id: "personajes", label: "Personajes", icon: Users }, { id: "estructura", label: "Estructura", icon: Layers },
    { id: "calendario", label: "Calendario", icon: CalendarIcon }, { id: "aparicion", label: "Línea aparición", icon: GitBranch }, { id: "linea", label: "Línea temporal", icon: GitBranch },
    { id: "localizacion", label: "Localización", icon: MapPin }, { id: "universo", label: "Universo", icon: Globe2 }, { id: "lore", label: "Lore", icon: ScrollText },
    { id: "pizarra", label: "Pizarra", icon: StickyNote }, { id: "exportar", label: "Exportar", icon: Download }, { id: "beta", label: "Beta lectores", icon: MessageSquare },
  ];
  if (isMobile) return (<div style={{ order: 0, display: "flex", overflowX: "auto", borderTop: "1px solid var(--border)", background: "var(--bg3)", padding: "6px 4px", gap: 2 }}>{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: tab === id ? "var(--bg2)" : "none", border: "none", borderRadius: 6, padding: "6px 10px", color: tab === id ? "var(--text)" : "var(--dim)", fontSize: 9.5 }}><Icon size={15} />{label}</button>)}</div>);
  return (<div style={{ width: collapsed ? 44 : 172, flexShrink: 0, borderLeft: "1px solid var(--border)", background: "var(--bg3)", display: "flex", flexDirection: "column", padding: "10px 6px", transition: "width 0.15s" }}><button onClick={() => setCollapsed((c) => !c)} style={{ ...iconBtn, alignSelf: collapsed ? "center" : "flex-end", marginBottom: 8 }}>{collapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}</button>{items.map(({ id, label, icon: Icon }) => (<button key={id} onClick={() => setTab(id)} title={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: collapsed ? "9px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", background: tab === id ? "var(--bg2)" : "none", border: "none", borderRight: tab === id ? "2px solid var(--accent)" : "2px solid transparent", color: tab === id ? "var(--text)" : "var(--dim)", fontSize: 12.5, cursor: "pointer", borderRadius: 6, marginBottom: 2, textAlign: "left" }}><Icon size={14} style={{ flexShrink: 0 }} /> {!collapsed && label}</button>))}</div>);
}

function DeleteCascadeModal({ kind, name, hasChildren, onClose, onConfirm }) {
  const [choice, setChoice] = useState(hasChildren ? null : "delete");
  const [step, setStep] = useState(0);
  if (choice === null) return (<Modal onClose={onClose}><div style={{ width: 380, maxWidth: "90vw" }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#C1594A" }}><AlertTriangle size={16} /><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>Eliminar {kind} "{name}"</div></div><div style={{ fontSize: 13.5, marginBottom: 16, color: "var(--text)" }}>Este {kind} contiene {kind === "universo" ? "sagas y libros" : "libros"}. ¿Qué quieres hacer con ellos?</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><button onClick={() => setChoice("keep")} style={{ ...smallOutlineBtn, justifyContent: "flex-start", padding: "10px 12px" }}>Eliminar solo {kind === "universo" ? "el universo (las sagas quedan sin universo)" : "la saga (los libros quedan sueltos)"}</button><button onClick={() => setChoice("delete")} style={{ ...smallOutlineBtn, justifyContent: "flex-start", padding: "10px 12px", borderColor: "#C1594A", color: "#C1594A" }}>Eliminar todo el contenido {kind === "universo" ? "(sagas y libros incluidos)" : "(libros y capítulos incluidos)"}</button></div><button onClick={onClose} style={{ ...smallOutlineBtn, marginTop: 14 }}>Cancelar</button></div></Modal>);
  const messages = [`¿Seguro que quieres borrar "${name}"?`, `Esta acción no se puede deshacer. ¿Confirmas borrar todo?`, `Última confirmación: pulsa "Borrar todo" para eliminar "${name}" definitivamente.`];
  return (<Modal onClose={onClose}><div style={{ width: 380, maxWidth: "90vw" }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#C1594A" }}><AlertTriangle size={16} /><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>Confirmación {step + 1} de 3</div></div><div style={{ fontSize: 13.5, marginBottom: 18, color: "var(--text)" }}>{messages[step]}</div><div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button onClick={onClose} style={smallOutlineBtn}>Cancelar</button><button onClick={() => (step < 2 ? setStep(step + 1) : (onConfirm(choice === "delete"), onClose()))} style={{ ...primaryBtn, background: "#C1594A" }}>{step < 2 ? "Continuar" : "Borrar todo"}</button></div></div></Modal>);
}

// ---------------- Library ----------------
function LibraryScreen({ universes, sagas, setSagas, books, setBooks, setUniverses, openBook, addUniverse, addSaga, addBook, deleteSagaCascade, deleteUniverseCascade, authorName, onOpenShelf, headerControls, isMobile, lastEditedBookId }) {
  const looseSagas = sagas.filter((s) => !s.universeId);
  const [infoBookId, setInfoBookId] = useState(null);
  const infoBook = books.find((b) => b.id === infoBookId);
  const [deleteTarget, setDeleteTarget] = useState(null);
  function setBookCover(id, file) { fileToDataUrl(file, (url) => setBooks((b) => b.map((bk) => (bk.id === id ? { ...bk, cover: url } : bk)))); }
  const sortedBooks = (list) => [...list].sort((a, b) => (a.numberInSaga ?? 999) - (b.numberInSaga ?? 999));
  function setSagaColor(sagaId, color) { setSagas((s) => s.map((x) => (x.id === sagaId ? { ...x, color } : x))); }

  function renderSaga(saga) {
    const sagaBooks = sortedBooks(books.filter((b) => b.sagaId === saga.id));
    return (
      <div key={saga.id} style={{ marginBottom: 24, borderLeft: saga.color ? `3px solid ${saga.color}` : "3px solid transparent", paddingLeft: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16 }}>{saga.name}</div>
          <div style={{ display: "flex", gap: 4 }}><button onClick={() => setSagaColor(saga.id, null)} title="Sin color propio" style={{ width: 14, height: 14, borderRadius: "50%", border: !saga.color ? "2px solid var(--accent)" : "1px solid var(--border)", background: "repeating-conic-gradient(var(--bg3) 0% 25%, var(--bg2) 0% 50%)", cursor: "pointer" }} />{COLOR_PRESETS.slice(0, 10).map((c) => <button key={c} onClick={() => setSagaColor(saga.id, c)} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: saga.color === c ? "2px solid var(--text)" : "1px solid var(--border)", cursor: "pointer" }} />)}</div>
          <button onClick={() => setDeleteTarget({ kind: "saga", id: saga.id, name: saga.name, hasChildren: sagaBooks.length > 0 })} style={miniIconBtn} title="Eliminar saga"><Trash2 size={13} /></button>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>{sagaBooks.map((b) => <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} onCover={(f) => setBookCover(b.id, f)} onInfo={() => setInfoBookId(b.id)} isLast={b.id === lastEditedBookId} />)}<AddCoverCard label="Nuevo libro" onClick={() => addBook(saga.id)} /></div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "18px 16px" : "28px 32px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><PenLine size={20} color="var(--accent)" /><span style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? 19 : 24, fontWeight: 600 }}>Tu biblioteca, {authorName}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><button onClick={onOpenShelf} style={smallOutlineBtn}><Library size={13} /> Ver estantería</button>{headerControls}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--dim)", marginBottom: 26 }}><Lock size={12} /> Solo visible para ti — sesión local</div>
      {universes.map((u) => { const uSagas = sagas.filter((s) => s.universeId === u.id); if (uSagas.length === 0) return null; return (<div key={u.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 26 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--accent)" }}><Globe2 size={14} /><span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, flex: 1 }}>Universo: {u.name}</span><button onClick={() => setDeleteTarget({ kind: "universo", id: u.id, name: u.name, hasChildren: uSagas.length > 0 })} style={miniIconBtn} title="Eliminar universo"><Trash2 size={13} /></button></div>{uSagas.map(renderSaga)}<button onClick={() => addSaga(u.id)} style={smallOutlineBtn}>+ Saga en este universo</button></div>); })}
      {looseSagas.map(renderSaga)}
      <div style={{ marginBottom: 24 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, marginBottom: 12 }}>Sueltos</div><div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>{books.filter((b) => !b.sagaId).map((b) => <BookCover key={b.id} book={b} onClick={() => openBook(b.id)} onCover={(f) => setBookCover(b.id, f)} onInfo={() => setInfoBookId(b.id)} isLast={b.id === lastEditedBookId} />)}<AddCoverCard label="Nuevo libro" onClick={() => addBook(null)} /></div></div>
      <div style={{ display: "flex", gap: 8 }}><button onClick={() => addSaga(null)} style={smallOutlineBtn}>+ Nueva saga</button><button onClick={addUniverse} style={smallOutlineBtn}>+ Nuevo universo</button></div>
      {infoBook && <BookInfoModal book={infoBook} onClose={() => setInfoBookId(null)} onUpdate={(patch) => setBooks((bs) => bs.map((b) => (b.id === infoBook.id ? { ...b, ...patch } : b)))} />}
      {deleteTarget && <DeleteCascadeModal kind={deleteTarget.kind} name={deleteTarget.name} hasChildren={deleteTarget.hasChildren} onClose={() => setDeleteTarget(null)} onConfirm={(deleteEverything) => (deleteTarget.kind === "saga" ? deleteSagaCascade(deleteTarget.id, deleteEverything) : deleteUniverseCascade(deleteTarget.id, deleteEverything))} />}
    </div>
  );
}

// ---------------- Biblioteca de Alejandría (canvas libre, 3 baldas) ----------------
function ShelfLibrary({ books, sagas, onBack, onOpenBook, isMobile, layout, setLayout, decor, setDecor, lastEditedBookId }) {
  const SHELVES = 3;
  const dragRef = useRef(null);
  const shelfH = isMobile ? 150 : 200;
  const containerH = shelfH * SHELVES + 40;

  const sagaSize = (sagaId) => { const variants = [{ w: 40, h: 130 }, { w: 46, h: 152 }, { w: 36, h: 112 }]; return variants[hash(sagaId + "sz") % variants.length]; };

  const positioned = useMemo(() => {
    const out = {};
    books.forEach((b, i) => {
      if (layout[b.id]) { out[b.id] = layout[b.id]; return; }
      const shelf = hash(b.id + "shelf") % SHELVES;
      const x = 40 + (hash(b.id + "posx") % 780);
      out[b.id] = { shelf, x };
    });
    return out;
  }, [books, layout]);

  function sizeFor(b) { return b.sagaId ? sagaSize(b.sagaId) : { w: 34 + (hash(b.id + "w") % 16), h: 100 + (hash(b.id + "h") % 40) }; }

  function startDrag(e, id, kind) { const pos = kind === "book" ? positioned[id] : decor.find((d) => d.id === id); dragRef.current = { id, kind, startX: e.clientX, startY: e.clientY, origX: kind === "book" ? pos.x : pos.x, origY: kind === "book" ? pos.shelf * shelfH : pos.y }; window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); }
  function onMove(e) {
    if (!dragRef.current) return;
    const { id, kind, startX, startY, origX, origY } = dragRef.current;
    const nx = Math.max(0, origX + (e.clientX - startX));
    const ny = Math.max(0, origY + (e.clientY - startY));
    if (kind === "book") { const shelf = Math.min(SHELVES - 1, Math.max(0, Math.round(ny / shelfH))); setLayout((l) => ({ ...l, [id]: { shelf, x: nx } })); }
    else setDecor((d) => d.map((it) => (it.id === id ? { ...it, x: nx, y: ny } : it)));
  }
  function onUp() { dragRef.current = null; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); }
  function addDecor(kind) { setDecor((d) => [...d, { id: uid(), kind, x: 60 + d.length * 30, y: 60 }]); }
  function removeDecor(id) { setDecor((d) => d.filter((x) => x.id !== id)); }

  return (
    <div style={{ padding: isMobile ? "18px 16px" : "24px 32px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, var(--bg) 0%, var(--bg3) 100%)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexShrink: 0, flexWrap: "wrap", gap: 10 }}>
        <button onClick={onBack} style={iconBtn} title="Volver a la biblioteca"><ArrowLeft size={15} /></button>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: isMobile ? 18 : 24, fontWeight: 600, letterSpacing: 0.5 }}>Biblioteca de Alejandría II</span>
        <div style={{ display: "flex", gap: 6 }}>{Object.entries(DECOR_ICONS).map(([kind, icon]) => <button key={kind} onClick={() => addDecor(kind)} style={smallOutlineBtn}>{icon} +</button>)}</div>
      </div>
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        <div style={{ position: "relative", width: "100%", minHeight: containerH }}>
          {Array.from({ length: SHELVES }, (_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: (i + 1) * shelfH - 12, height: 12, background: "#5a4326", boxShadow: "0 4px 6px rgba(0,0,0,0.25)" }} />)}
          {books.map((b) => {
            const pos = positioned[b.id]; const { w, h } = sizeFor(b);
            const isLightColor = ["#F5F3EB", "#E8C547"].includes(b.color);
            const saga = sagas.find((s) => s.id === b.sagaId);
            const fontSize = Math.max(7.5, Math.min(11, (h - 14) / Math.max(b.title.length, 6) * 1.6));
            return (
              <div key={b.id} onPointerDown={(e) => startDrag(e, b.id, "book")} onClick={() => onOpenBook(b.id)} title={b.title} style={{ position: "absolute", left: pos.x, top: (pos.shelf + 1) * shelfH - 12 - h, cursor: "grab", width: w, height: h, background: b.color, borderRadius: "2px 4px 4px 2px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", boxShadow: "1px 0 3px rgba(0,0,0,0.35)", paddingTop: 4 }}>
                <span style={{ writingMode: "vertical-rl", fontSize, lineHeight: 1.15, fontFamily: "'Fraunces', serif", fontWeight: 600, color: isLightColor ? "#2B2A25" : "#241d12", whiteSpace: "nowrap", padding: "2px 0" }}>{b.title}</span>
                {saga?.color && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 9, background: saga.color }} />}
                {b.id === lastEditedBookId && <Star size={11} color="#FFD65A" fill="#FFD65A" style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)" }} />}
              </div>
            );
          })}
          {decor.map((d) => (
            <div key={d.id} onPointerDown={(e) => startDrag(e, d.id, "decor")} style={{ position: "absolute", left: d.x, top: d.y, fontSize: 30, cursor: "grab", filter: d.kind === "luna" ? "drop-shadow(0 0 6px #F6E27A)" : "none" }}>
              {DECOR_ICONS[d.kind]}
              <button onClick={(e) => { e.stopPropagation(); removeDecor(d.id); }} style={{ position: "absolute", top: -8, right: -8, background: "rgba(10,10,14,0.6)", border: "none", borderRadius: "50%", width: 14, height: 14, color: "#fff", fontSize: 9, cursor: "pointer", lineHeight: "14px" }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookCover({ book, onClick, onCover, onInfo, isLast }) {
  const fileRef = useRef(null);
  const status = STATUS[book.status] || STATUS.sin_empezar;
  const isLightColor = ["#F5F3EB", "#E8C547"].includes(book.color);
  return (
    <div style={{ width: 136 }}>
      <div onClick={onClick} style={{ width: 136, height: 184, borderRadius: 8, cursor: "pointer", position: "relative", overflow: "hidden", background: book.cover ? `url(${book.cover}) center/cover` : book.color, border: "1px solid var(--border)", display: "flex", alignItems: "flex-end" }}>
        {!book.cover && <div style={{ padding: 10, fontFamily: "'Fraunces', serif", fontSize: 13, color: isLightColor ? "#2B2A25" : "#15161d", fontWeight: 600 }}>{book.title}</div>}
        <span title={status.label} style={{ position: "absolute", top: 7, left: 7, width: 9, height: 9, borderRadius: "50%", background: status.color, border: "1px solid rgba(0,0,0,0.3)" }} />
        {isLast && <Star size={13} color="#FFD65A" fill="#FFD65A" style={{ position: "absolute", top: 6, right: 32 }} />}
        <button onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }} style={{ position: "absolute", top: 6, right: 6, background: "rgba(10,10,14,0.55)", border: "none", borderRadius: 5, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Cambiar portada"><ImageIcon size={11} color="#EDE9DD" /></button>
        <button onClick={(e) => { e.stopPropagation(); onInfo(); }} style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(10,10,14,0.55)", border: "none", borderRadius: 5, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Ver datos del libro"><Info size={11} color="#EDE9DD" /></button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && onCover(e.target.files[0])} />
      </div>
      <div style={{ fontSize: 12, marginTop: 6, color: "var(--text)" }}>{book.title}{book.numberInSaga ? ` · Libro ${book.numberInSaga}` : ""}</div>
    </div>
  );
}
function AddCoverCard({ label, onClick }) { return <button onClick={onClick} style={{ width: 136, height: 184, borderRadius: 8, border: "1px dashed var(--border)", background: "none", color: "var(--dim)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5 }}><Plus size={18} /> {label}</button>; }

function BookInfoModal({ book, onClose, onUpdate }) {
  const activity = useMemo(() => activityWithDates(book.id), [book.id]);
  const [hoverDay, setHoverDay] = useState(null);
  const levelColor = (lvl) => ["var(--bg3)", "#2c4a3a", "#3b6b4f", "#4f9a6c", "#5FA98C"][lvl] || "var(--bg3)";
  const set = (f) => (e) => onUpdate({ [f]: e.target.value });
  return (
    <Modal onClose={onClose}>
      <div style={{ width: 560, maxWidth: "90vw", maxHeight: "78vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><input value={book.title} onChange={set("title")} style={{ ...titleInput, fontSize: 20 }} /><button onClick={onClose} style={iconBtn}><X size={14} /></button></div>
        <Row2><Field label="Número en la saga (también ordena el estante)" value={book.numberInSaga || ""} onChange={(v) => onUpdate({ numberInSaga: v ? Number(v) : null })} type="number" /><Field label="Estado" custom={<select value={book.status} onChange={set("status")} style={selectInput}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>} /></Row2>
        <Row2><Field label="Género" custom={<select value={book.genre} onChange={set("genre")} style={selectInput}><option value="">-</option>{GENRES.map((g) => <option key={g}>{g}</option>)}</select>} /><Field label="Subgénero" value={book.subgenre} onChange={(v) => onUpdate({ subgenre: v })} /></Row2>
        <Row2><Field label="Fecha de creación" value={book.dateCreated} onChange={(v) => onUpdate({ dateCreated: v })} type="date" /><Field label="Fecha de finalización" value={book.dateFinished} onChange={(v) => onUpdate({ dateFinished: v })} type="date" /></Row2>
        <Field label="Narrador/es" value={book.narrators} onChange={(v) => onUpdate({ narrators: v })} />
        <div style={{ marginBottom: 10 }}><div style={fieldLabel}>Persona narrativa</div><select value={book.narrativePerson} onChange={set("narrativePerson")} style={selectInput}><option value="">-</option>{NARRATIVE_PERSON.map((p) => <option key={p}>{p}</option>)}</select></div>
        <FieldArea label="Sinopsis" value={book.sinopsis} onChange={(v) => onUpdate({ sinopsis: v })} />
        <div style={fieldLabel}>Color del libro</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>{COLOR_PRESETS.map((c) => <button key={c} title={COLOR_NAMES[c] || ""} onClick={() => onUpdate({ color: c })} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: book.color === c ? "2px solid var(--accent)" : "1px solid var(--border)", cursor: "pointer" }} />)}</div>
        <div style={fieldLabel}>Actividad de escritura (último año) — pasa el ratón por un día</div>
        <div style={{ display: "grid", gridTemplateRows: "repeat(7, 8px)", gridAutoFlow: "column", gap: 2, marginTop: 6, overflowX: "auto" }}>{activity.map((cell, i) => <div key={i} onMouseEnter={() => setHoverDay(cell)} onMouseLeave={() => setHoverDay(null)} style={{ width: 8, height: 8, borderRadius: 2, background: levelColor(cell.level) }} />)}</div>
        <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 6, height: 16 }}>{hoverDay ? DATE_FMT.format(hoverDay.date) : "\u00A0"}</div>
      </div>
    </Modal>
  );
}
function BookTopBar({ book, onBack, headerControls }) { return <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><button onClick={onBack} style={iconBtn} title="Volver a la biblioteca"><ArrowLeft size={15} /></button><div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, flex: 1, minWidth: 100 }}>{book?.title}</div>{headerControls}</div>; }
function Modal({ children, onClose }) { return <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,14,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 12 }} onClick={onClose}><div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: "95vw" }}>{children}</div></div>; }

// ---------------- Capítulos ----------------
const NOTE_THEMES = ["Continuidad", "Ritmo", "Estilo", "Investigar", "Lo quitaría"];
const NOTE_COLORS = { "Continuidad": "#C9A24B", "Ritmo": "#C1594A", "Estilo": "#6E93C9", "Investigar": "#5FA98C", "Lo quitaría": "#8B4A6B" };

function ChaptersTab({ bookId, chapters, setChapters, bookActs, setBookActs, isMobile }) {
  const bookChapters = useMemo(() => chapters.filter((c) => c.bookId === bookId).sort((a, b) => a.order - b.order), [chapters, bookId]);
  const [activeId, setActiveId] = useState(bookChapters[0]?.id ?? null);
  const [showNotes, setShowNotes] = useState(!isMobile);
  const [dirty, setDirty] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState(null);
  const [showManuscript, setShowManuscript] = useState(false);
  const [wc, setWc] = useState(0);
  const [showNoteForm, setShowNoteForm] = useState(null);
  const [noteDraft, setNoteDraft] = useState({ theme: "Continuidad", excerpt: "", comment: "", markId: null });
  const [savedFlash, setSavedFlash] = useState(false);
  const editorRef = useRef(null);
  const autosaveTimer = useRef(null);
  const history = useRef([]);

  useEffect(() => { if (!bookChapters.find((c) => c.id === activeId)) setActiveId(bookChapters[0]?.id ?? null); }, [bookId]); // eslint-disable-line
  const active = bookChapters.find((c) => c.id === activeId);
  useEffect(() => { if (editorRef.current && active) { editorRef.current.innerHTML = active.content; setWc(wordCount(active.content)); } setDirty(false); history.current = []; }, [activeId]); // eslint-disable-line
  const povColor = (pov) => ["#6E93C9", "#C9A24B", "#C06E97", "#5FA98C", "#C1594A", "#7A5EA8"][hash(pov) % 6];

  function addChapter() { const title = prompt("Título del capítulo:") || `Capítulo ${bookChapters.length + 1}`; const nc = { id: uid(), bookId, title, pov: "", brief: "", tension: 2, order: bookChapters.length, content: "", dropCap: true, justify: true, indent: true, font: "Fraunces", readOnly: false, notes: [], betaComments: [] }; setChapters((cs) => [...cs, nc]); requestSwitch(nc.id, true); }
  function deleteChapter() { if (!active) return; if (!confirm(`¿Eliminar el capítulo "${active.title}"? Esta acción no se puede deshacer.`)) return; setChapters((cs) => cs.filter((c) => c.id !== active.id)); setActiveId(bookChapters.find((c) => c.id !== active.id)?.id ?? null); }
  function updateActive(patch) { setChapters((cs) => cs.map((c) => (c.id === activeId ? { ...c, ...patch } : c))); }
  function pushHistory() { if (editorRef.current) history.current = [editorRef.current.innerHTML, ...history.current].slice(0, 3); }
  function undo() { if (history.current.length === 0) return; const [prev, ...rest] = history.current; if (editorRef.current) editorRef.current.innerHTML = prev; history.current = rest; handleInput(false); }
  function saveContent() { if (editorRef.current) updateActive({ content: editorRef.current.innerHTML }); setDirty(false); setSavedFlash(true); clearTimeout(autosaveTimer.current); autosaveTimer.current = setTimeout(() => setSavedFlash(false), 1400); }
  function requestSwitch(id, skip) { if (dirty && !skip) { setPendingSwitch(id); return; } saveContent(); setActiveId(id); }
  function confirmSave() { saveContent(); setActiveId(pendingSwitch); setPendingSwitch(null); }
  function confirmDiscard() { setActiveId(pendingSwitch); setPendingSwitch(null); }
  function move(dir) { const idx = bookChapters.findIndex((c) => c.id === activeId); const swapIdx = idx + dir; if (swapIdx < 0 || swapIdx >= bookChapters.length) return; const a = bookChapters[idx], b = bookChapters[swapIdx]; setChapters((cs) => cs.map((c) => c.id === a.id ? { ...c, order: b.order } : c.id === b.id ? { ...c, order: a.order } : c)); }
  function exec(cmd, val) { pushHistory(); document.execCommand(cmd, false, val); editorRef.current?.focus(); handleInput(false); }
  function handleInput(recordHistory = true) { if (recordHistory) pushHistory(); setDirty(true); if (editorRef.current) setWc(wordCount(editorRef.current.innerHTML)); clearTimeout(autosaveTimer.current); autosaveTimer.current = setTimeout(() => saveContent(), 900); }

  function openNoteForm() {
    const sel = window.getSelection();
    const text = sel && sel.toString();
    if (!text || !text.trim()) { alert("Primero selecciona el fragmento de texto sobre el que quieres dejar la nota."); return; }
    const markId = uid();
    document.execCommand("insertHTML", false, `<mark data-note="${markId}" style="background:${NOTE_COLORS["Continuidad"]}33;border-bottom:2px solid ${NOTE_COLORS["Continuidad"]};color:inherit;border-radius:2px;padding:0 1px">${text}</mark>`);
    handleInput(true); saveContent();
    setNoteDraft({ theme: "Continuidad", excerpt: text, comment: "", markId });
    setShowNoteForm("new");
  }
  function openEditNote(n) { setNoteDraft({ theme: n.theme, excerpt: n.excerpt, comment: n.comment, markId: n.markId }); setShowNoteForm(n.id); }
  function submitNote() {
    if (!noteDraft.comment.trim()) return;
    const color = NOTE_COLORS[noteDraft.theme] || "#888";
    if (noteDraft.markId && editorRef.current) { editorRef.current.innerHTML = editorRef.current.innerHTML.replace(new RegExp(`(<mark data-note="${noteDraft.markId}"[^>]*>)`), `<mark data-note="${noteDraft.markId}" style="background:${color}33;border-bottom:2px solid ${color};color:inherit;border-radius:2px;padding:0 1px">`); saveContent(); }
    if (showNoteForm === "new") updateActive({ notes: [...(active.notes || []), { id: uid(), theme: noteDraft.theme, color, excerpt: noteDraft.excerpt, comment: noteDraft.comment, markId: noteDraft.markId }] });
    else updateActive({ notes: active.notes.map((n) => (n.id === showNoteForm ? { ...n, theme: noteDraft.theme, color, comment: noteDraft.comment } : n)) });
    setShowNoteForm(null);
  }
  function removeNote(id) {
    const note = active.notes.find((n) => n.id === id);
    if (note?.markId && editorRef.current) { editorRef.current.innerHTML = editorRef.current.innerHTML.replace(new RegExp(`<mark data-note="${note.markId}"[^>]*>(.*?)</mark>`), "$1"); saveContent(); }
    updateActive({ notes: active.notes.filter((n) => n.id !== id) });
  }
  function renameAct(actId) { const act = bookActs.find((a) => a.id === actId); const name = prompt("Nuevo nombre del acto:", act?.name); if (!name) return; setBookActs((all) => ({ ...all, [bookId]: (all[bookId] || []).map((a) => (a.id === actId ? { ...a, name } : a)) })); }

  const combinedMarks = active ? [
    ...(active.notes || []).map((n) => ({ ...n, kind: "note", pos: n.excerpt && active.content ? active.content.indexOf(n.excerpt) : -1 })),
    ...(active.betaComments || []).map((c) => ({ ...c, kind: "beta", pos: c.excerpt && active.content ? active.content.indexOf(c.excerpt) : -1 })),
  ].sort((a, b) => (a.pos === -1 ? 1e9 : a.pos) - (b.pos === -1 ? 1e9 : b.pos)) : [];

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, height: "100%" }}>
      <div style={{ width: isMobile ? "100%" : 220, flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <button onClick={addChapter} style={primaryBtn}><Plus size={13} /> Nuevo capítulo</button>
        <button onClick={() => setShowManuscript(true)} style={{ ...smallOutlineBtn, width: "100%", justifyContent: "center", marginTop: 8 }}><BookMarked size={12} /> Ver manuscrito completo</button>
        <div style={{ marginTop: 10, display: "flex", flexDirection: isMobile ? "row" : "column", gap: 3, overflowX: isMobile ? "auto" : "visible", overflowY: isMobile ? "visible" : "auto", maxHeight: isMobile ? "none" : 480, paddingRight: 4 }}>
          {bookChapters.map((c, i) => { const act = actForOrder(c.order, bookActs); return (<button key={c.id} onClick={() => requestSwitch(c.id)} style={{ flexShrink: 0, minWidth: isMobile ? 140 : "auto", textAlign: "left", background: c.id === activeId ? "var(--bg2)" : "none", border: "none", borderLeft: `3px solid ${act?.color || "transparent"}`, borderRadius: 4, padding: "8px 8px", cursor: "pointer", color: c.id === activeId ? "var(--text)" : "var(--dim)", fontSize: 13 }}><div><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--dim)", marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>{c.title}</div>{c.pov && <div style={{ fontSize: 10, marginTop: 2, color: povColor(c.pov) }}>● POV: {c.pov}</div>}{act && <div onClick={(e) => { e.stopPropagation(); renameAct(act.id); }} style={{ fontSize: 9.5, marginTop: 2, color: act.color, cursor: "pointer" }} title="Renombrar acto">{act.name} <Pencil size={9} style={{ display: "inline", verticalAlign: "middle" }} /></div>}</button>); })}
        </div>
      </div>
      {active ? (
        <div style={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16, minWidth: 0 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--dim)" }}>Cap. {bookChapters.findIndex((c) => c.id === activeId) + 1}</span>
              <input value={active.title} onChange={(e) => { updateActive({ title: e.target.value }); setDirty(true); }} style={{ ...titleInput, flex: 1, minWidth: 120 }} />
              <input value={active.pov} onChange={(e) => { updateActive({ pov: e.target.value }); setDirty(true); }} placeholder="POV / narrador" style={{ ...textInput, width: 120 }} />
              <button onClick={() => move(-1)} style={iconBtn}>↑</button><button onClick={() => move(1)} style={iconBtn}>↓</button>
              <button onClick={deleteChapter} style={{ ...iconBtn, color: "#C1594A" }} title="Eliminar capítulo"><Trash2 size={13} /></button>
            </div>
            <input value={active.brief} onChange={(e) => updateActive({ brief: e.target.value })} placeholder="Breve descripción de qué trata este capítulo..." style={{ ...textInput, marginBottom: 8, fontStyle: "italic" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <select value={active.font} onChange={(e) => updateActive({ font: e.target.value })} style={selectInput}><option value="Fraunces">Fraunces</option><option value="Playfair Display">Playfair Display</option><option value="Merriweather">Merriweather</option><option value="Inter">Inter (sans)</option></select>
              <button onClick={() => exec("bold")} style={iconBtn}><Bold size={13} /></button><button onClick={() => exec("italic")} style={iconBtn}><Italic size={13} /></button><button onClick={() => exec("underline")} style={iconBtn}><Underline size={13} /></button>
              <button onClick={() => updateActive({ justify: !active.justify })} style={{ ...iconBtn, ...(active.justify ? toggleBtnActive : {}) }}><AlignJustify size={13} /></button>
              <button onClick={() => updateActive({ indent: !active.indent })} style={{ ...toggleBtn, ...(active.indent ? toggleBtnActive : {}) }}>Sangría</button>
              <button onClick={() => updateActive({ dropCap: !active.dropCap })} style={{ ...toggleBtn, ...(active.dropCap ? toggleBtnActive : {}) }}>Letra capital</button>
              <button onClick={() => exec("insertHorizontalRule")} style={iconBtn}><Minus size={13} /></button>
              <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 5px" }} title="Subrayador (semitransparente para leerse bien en cualquier tema)"><Highlighter size={13} color="var(--dim)" />{HIGHLIGHTER_COLORS.map((c) => <button key={c} onClick={() => exec("hiliteColor", c)} style={{ width: 13, height: 13, borderRadius: 3, background: c, border: "1px solid rgba(120,120,120,0.4)", cursor: "pointer" }} />)}<button onClick={() => exec("hiliteColor", "transparent")} style={{ ...miniIconBtn, marginLeft: 2 }} title="Quitar subrayado"><X size={11} /></button></div>
              <button onClick={undo} style={iconBtn} title="Deshacer (hasta 3 pasos)"><Undo2 size={13} /></button>
              <button onClick={() => updateActive({ readOnly: !active.readOnly })} style={{ ...toggleBtn, ...(active.readOnly ? toggleBtnActive : {}) }}><EyeOff size={12} /> Solo lectura</button>
              <button onClick={() => setShowNotes((v) => !v)} style={{ ...toggleBtn, ...(showNotes ? toggleBtnActive : {}) }}><StickyNote size={13} /></button>
              <button onClick={saveContent} style={{ ...toggleBtn, ...(dirty ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}) }}>{savedFlash ? <><Check size={12} /> Guardado</> : dirty ? "Guardar" : "Guardado"}</button>
              <span style={{ fontSize: 11, color: "var(--dim)", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{wc} palabras · {pageCount(wc)} hoja{pageCount(wc) === 1 ? "" : "s"}</span>
            </div>
            <div ref={editorRef} contentEditable={!active.readOnly} suppressContentEditableWarning onInput={() => handleInput(true)} onBeforeInput={pushHistory} className={active.dropCap ? "dropcap-editor" : ""} style={{ flex: 1, minHeight: 200, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 22, color: "var(--text)", fontFamily: `'${active.font}', serif`, fontSize: 16.5, lineHeight: 1.8, outline: "none", textAlign: active.justify ? "justify" : "left", overflowY: "auto", textIndent: active.indent ? "2em" : 0, opacity: active.readOnly ? 0.75 : 1 }} />
            <style>{`.dropcap-editor::first-letter{font-size:2.6em;float:left;line-height:0.75;padding-right:6px;margin-top:2px;font-family:'${active.font}',serif;color:var(--accent)}`}</style>
            <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 6 }}>Para comentar un fragmento: selecciónalo con el ratón y luego pulsa "+ Nota".</div>
          </div>
          {showNotes && (
            <div style={{ width: isMobile ? "100%" : 240, flexShrink: 0 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--dim)", marginBottom: 8 }}>Notas y comentarios (en orden del texto)</div>
              <button onClick={openNoteForm} style={smallOutlineBtn}>+ Nota (sobre selección)</button>
              {showNoteForm && (<div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}><select value={noteDraft.theme} onChange={(e) => setNoteDraft((d) => ({ ...d, theme: e.target.value }))} style={selectInput}>{NOTE_THEMES.map((t) => <option key={t}>{t}</option>)}</select><div style={{ fontSize: 11, color: "var(--dim)", fontStyle: "italic" }}>"{noteDraft.excerpt}"</div><textarea value={noteDraft.comment} onChange={(e) => setNoteDraft((d) => ({ ...d, comment: e.target.value }))} placeholder="Escribe la nota..." rows={2} style={textArea} /><div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}><button onClick={() => setShowNoteForm(null)} style={smallOutlineBtn}>Cancelar</button><button onClick={submitNote} style={primaryBtn}>Guardar nota</button></div></div>)}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {combinedMarks.map((n) => n.kind === "note" ? (<div key={n.id} onClick={() => openEditNote(n)} style={{ background: "var(--bg2)", border: `1px solid ${n.color}55`, borderLeft: `3px solid ${n.color}`, borderRadius: 6, padding: 10, fontSize: 12.5, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: n.color, fontSize: 10.5, textTransform: "uppercase" }}>{n.theme}</span><button onClick={(e) => { e.stopPropagation(); removeNote(n.id); }} style={miniIconBtn}><X size={11} /></button></div>{n.excerpt && <div style={{ color: "var(--dim)", fontStyle: "italic", marginBottom: 4 }}>"{n.excerpt}"</div>}<div style={{ color: "var(--text)" }}>{n.comment}</div></div>) : (<div key={n.id} style={{ background: "var(--bg2)", border: `1px solid ${colorForReader(n.reader)}55`, borderLeft: `3px solid ${colorForReader(n.reader)}`, borderRadius: 6, padding: 10, fontSize: 12.5 }}><span style={{ color: colorForReader(n.reader), fontWeight: 600 }}>{n.reader} ha comentado:</span> {n.excerpt && <div style={{ color: "var(--dim)", fontStyle: "italic", margin: "2px 0" }}>"{n.excerpt}"</div>} <span style={{ color: "var(--text)" }}>{n.comment}</span></div>))}
                {combinedMarks.length === 0 && !showNoteForm && <div style={{ color: "var(--dim)", fontSize: 11.5 }}>Sin notas todavía.</div>}
              </div>
            </div>
          )}
        </div>
      ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dim)" }}>Crea un capítulo para empezar.</div>}
      {pendingSwitch && (<Modal onClose={confirmDiscard}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10 }}>¿Guardar los cambios?</div><div style={{ color: "var(--text)", fontSize: 13.5, marginBottom: 16 }}>Has editado este capítulo y no lo has guardado. Si sales sin guardar, se perderán los cambios.</div><div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button onClick={confirmDiscard} style={smallOutlineBtn}>Salir sin guardar</button><button onClick={confirmSave} style={primaryBtn}>Guardar y salir</button></div></Modal>)}
      {showManuscript && (<Modal onClose={() => setShowManuscript(false)}><div style={{ width: 620, maxWidth: "90vw", maxHeight: "78vh", overflowY: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 19 }}>Manuscrito completo (solo lectura)</div><button onClick={() => setShowManuscript(false)} style={iconBtn}><X size={14} /></button></div>{bookChapters.map((c, i) => <div key={c.id} style={{ marginBottom: 26 }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--dim)" }}>Capítulo {i + 1}{c.pov ? ` · POV: ${c.pov}` : ""}</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, marginBottom: 8 }}>{c.title}</div><div dangerouslySetInnerHTML={{ __html: c.content }} style={{ fontFamily: `'${c.font}', serif`, fontSize: 15, lineHeight: 1.8, textAlign: c.justify ? "justify" : "left" }} /></div>)}</div></Modal>)}
    </div>
  );
}

// ---------------- Personajes ----------------
function CharactersTab({ sagaId, bookId, books, bookActs, characters, setCharacters, ideas, setIdeas, light, relPositions, setRelPositions }) {
  const allSagaChars = useMemo(() => characters.filter((c) => c.sagaId === sagaId).sort((a, b) => a.order - b.order), [characters, sagaId]);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("fichas");
  const [filterImportance, setFilterImportance] = useState("Todos");
  const [filterNature, setFilterNature] = useState("Todos");
  const [search, setSearch] = useState("");
  const dragIdRef = useRef(null);
  const highlight = protagColor(light);
  const sagaChars = allSagaChars.filter((c) => (filterImportance === "Todos" || c.importance === filterImportance) && (filterNature === "Todos" || c.natureType === filterNature) && c.name.toLowerCase().includes(search.toLowerCase()));

  function addCharacter() { const name = prompt("Nombre del personaje:"); if (!name) return; const nc = { id: uid(), sagaId, order: allSagaChars.length, name, nickname: "", customFamilyTag: "", photo: null, emblem: null, importance: "Secundario", lineageGroup: "", powerLevel: 3, natureType: "Humano", natureSubtype: "", natureSubtypeOther: "", natureEffect: "", isMilitary: false, militaryRank: "", isNoble: false, nobleTitle: "", isDead: false, deathBookId: "", deathNote: "", age: "", birthday: "", birthplace: "", civilStatus: "", title: "", occupation: "", physicalHeight: "", physicalDesc: "", role: "", motivation: "", virtues: "", defects: "", weakness: "", personality: "", itemsCarried: "", importantItems: "", hobbies: "", trivia: "", statusByBook: {}, roleByBook: {}, relationships: [] }; setCharacters((cs) => [...cs, nc]); setSelectedId(nc.id); }
  function reorder(fromId, toId) { if (fromId === toId) return; const ordered = [...allSagaChars]; const fromIdx = ordered.findIndex((c) => c.id === fromId), toIdx = ordered.findIndex((c) => c.id === toId); const [moved] = ordered.splice(fromIdx, 1); ordered.splice(toIdx, 0, moved); const orderMap = Object.fromEntries(ordered.map((c, i) => [c.id, i])); setCharacters((cs) => cs.map((c) => (c.sagaId === sagaId ? { ...c, order: orderMap[c.id] ?? c.order } : c))); }
  function updateCharacterBidirectional(id, patch) { setCharacters((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))); }
  function addRelationshipBoth(sourceId, targetId, type, note) { const relId1 = uid(), relId2 = uid(); setCharacters((cs) => cs.map((c) => { if (c.id === sourceId) return { ...c, relationships: [...c.relationships, { id: relId1, targetId, type, note }] }; if (c.id === targetId) return { ...c, relationships: [...c.relationships, { id: relId2, targetId: sourceId, type: REL_RECIPROCAL[type] ? REL_RECIPROCAL[type] : type, note }] }; return c; })); }
  function removeRelationshipBoth(sourceId, relId, targetId) { setCharacters((cs) => cs.map((c) => { if (c.id === sourceId) return { ...c, relationships: c.relationships.filter((r) => r.id !== relId) }; if (c.id === targetId) return { ...c, relationships: c.relationships.filter((r) => r.targetId !== sourceId) }; return c; })); }
  const selected = characters.find((c) => c.id === selectedId);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setView("fichas")} style={{ ...toggleBtn, ...(view === "fichas" ? toggleBtnActive : {}) }}>Fichas</button>
          <button onClick={() => setView("red")} style={{ ...toggleBtn, ...(view === "red" ? toggleBtnActive : {}) }}><Link2 size={13} /> Mapa de relaciones</button>
          <button onClick={() => setView("linaje")} style={{ ...toggleBtn, ...(view === "linaje" ? toggleBtnActive : {}) }}><GitBranch size={13} /> Árbol de casas</button>
          <button onClick={() => setView("familia")} style={{ ...toggleBtn, ...(view === "familia" ? toggleBtnActive : {}) }}><Users size={13} /> Árbol familiar</button>
          <button onClick={() => setView("alturas")} style={{ ...toggleBtn, ...(view === "alturas" ? toggleBtnActive : {}) }}><Ruler size={13} /> Comparar alturas</button>
          <button onClick={() => setView("ideas")} style={{ ...toggleBtn, ...(view === "ideas" ? toggleBtnActive : {}) }}><Quote size={13} /> Frases e ideas</button>
          {view === "fichas" && (<><div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px" }}><Search size={12} color="var(--dim)" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 12, width: 100 }} /></div><select value={filterImportance} onChange={(e) => setFilterImportance(e.target.value)} style={selectInput}><option>Todos</option>{IMPORTANCE.map((i) => <option key={i}>{i}</option>)}</select><select value={filterNature} onChange={(e) => setFilterNature(e.target.value)} style={selectInput}><option>Todos</option>{NATURE_TYPES.map((n) => <option key={n}>{n}</option>)}</select></>)}
        </div>
        <button onClick={addCharacter} style={primaryBtn}><Plus size={13} /> Nuevo personaje</button>
      </div>
      {view === "fichas" && (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>{sagaChars.map((c) => { const isProtag = c.importance === "Principal"; return (<div key={c.id} draggable onDragStart={() => (dragIdRef.current = c.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => reorder(dragIdRef.current, c.id)} onClick={() => setSelectedId(c.id)} style={{ background: "var(--bg2)", border: `1px solid ${isProtag ? highlight : "var(--border)"}`, boxShadow: isProtag ? `0 0 0 1px ${highlight}55` : "none", borderRadius: 10, padding: 14, cursor: "grab", position: "relative", opacity: c.isDead ? 0.75 : 1 }}><GripVertical size={13} color="var(--dim)" style={{ position: "absolute", top: 10, right: 10 }} /><div style={{ width: 44, height: 44, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 16, marginBottom: 10, position: "relative", border: isProtag ? `2px solid ${highlight}` : "none" }}>{!c.photo && c.name.charAt(0)}{c.isDead && <Skull size={13} color="#C1594A" style={{ position: "absolute", bottom: -3, right: -3, background: "var(--bg2)", borderRadius: "50%", padding: 1 }} />}</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, marginBottom: 1, color: isProtag ? highlight : "var(--text)" }}>{c.name}</div>{c.nickname && <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--dim)", marginBottom: 4 }}>"{c.nickname}"</div>}<div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>{c.importance && <Badge text={c.importance} color={isProtag ? highlight : "var(--accent)"} />}{c.natureType === "Sobrenatural" && <Badge text={c.natureSubtype && c.natureSubtype !== "Otro" ? c.natureSubtype : c.natureType} color="#7A5EA8" />}{c.isMilitary && c.militaryRank && <Badge text={c.militaryRank} color="#C1594A" />}{c.isNoble && c.nobleTitle && <Badge text={c.nobleTitle} color="#C9A24B" />}{c.customFamilyTag && <Badge text={c.customFamilyTag} color="#8AA85F" />}</div><div style={{ fontSize: 11.5, color: "var(--dim)", minHeight: 28 }}>{c.role || "Rol sin definir"}</div>{c.statusByBook[bookId] && <div style={{ marginTop: 8, fontSize: 11, color: "var(--accent)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>{c.statusByBook[bookId]}</div>}</div>); })}{sagaChars.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Sin resultados.</div>}</div>)}
      {view === "red" && <RelationshipWeb characters={allSagaChars} onSelect={setSelectedId} highlight={highlight} positions={relPositions} setPositions={setRelPositions} />}
      {view === "linaje" && <LineageTree characters={allSagaChars} onSelect={setSelectedId} highlight={highlight} />}
      {view === "familia" && <FamilyTree characters={allSagaChars} onSelect={setSelectedId} highlight={highlight} />}
      {view === "alturas" && <HeightCompare characters={allSagaChars} highlight={highlight} />}
      {view === "ideas" && <IdeasTab sagaId={sagaId} characters={allSagaChars} books={books} bookActs={bookActs} ideas={ideas} setIdeas={setIdeas} />}
      {selected && <CharacterPanel character={selected} bookId={bookId} books={books} allChars={allSagaChars} onClose={() => setSelectedId(null)} onUpdate={(patch) => updateCharacterBidirectional(selected.id, patch)} onAddRelationship={(targetId, type, note) => addRelationshipBoth(selected.id, targetId, type, note)} onRemoveRelationship={(relId, targetId) => removeRelationshipBoth(selected.id, relId, targetId)} onDelete={() => { setCharacters((cs) => cs.filter((c) => c.id !== selected.id)); setSelectedId(null); }} />}
    </div>
  );
}

function Badge({ text, color }) { return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: color + "22", color, border: `1px solid ${color}55` }}>{text}</span>; }

function IdeasTab({ sagaId, characters, books, bookActs, ideas, setIdeas }) {
  const sagaIdeas = ideas.filter((i) => i.sagaId === sagaId);
  const [draft, setDraft] = useState({ text: "", characterId: "", bookId: "", actId: "" });
  const draftActs = draft.bookId ? (bookActs[draft.bookId] || []) : [];
  function add() { if (!draft.text.trim()) return; setIdeas((i) => [...i, { id: uid(), sagaId, ...draft }]); setDraft({ text: "", characterId: "", bookId: "", actId: "" }); }
  function remove(id) { setIdeas((i) => i.filter((x) => x.id !== id)); }
  return (
    <div>
      <div style={fieldLabel}>Frases sueltas, diálogos o ideas de personajes para recoger sin perderlas</div>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, margin: "10px 0 16px" }}>
        <textarea value={draft.text} onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))} rows={2} placeholder="Ej: A Dain le viene un recuerdo sobre ropa rota al escuchar música..." style={textArea} />
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}><select value={draft.characterId} onChange={(e) => setDraft((d) => ({ ...d, characterId: e.target.value }))} style={selectInput}><option value="">Personaje (opcional)</option>{characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={draft.bookId} onChange={(e) => setDraft((d) => ({ ...d, bookId: e.target.value, actId: "" }))} style={selectInput}><option value="">Libro (opcional)</option>{books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}</select>{draft.bookId && <select value={draft.actId} onChange={(e) => setDraft((d) => ({ ...d, actId: e.target.value }))} style={selectInput}><option value="">Acto (opcional)</option>{draftActs.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>}<button onClick={add} style={smallOutlineBtn}>+ Guardar idea</button></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{sagaIdeas.map((i) => { const char = characters.find((c) => c.id === i.characterId), book = books.find((b) => b.id === i.bookId), act = book && (bookActs[book.id] || []).find((a) => a.id === i.actId); return (<div key={i.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 13 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ color: "var(--text)" }}>{i.text}</div><button onClick={() => remove(i.id)} style={miniIconBtn}><X size={11} /></button></div><div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>{char && <Badge text={char.name} color="var(--accent)" />}{book && <Badge text={book.title + (act ? ` · ${act.name}` : "")} color="#6E93C9" />}</div></div>); })}{sagaIdeas.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin ideas guardadas todavía.</div>}</div>
    </div>
  );
}

function HeightCompare({ characters, highlight }) {
  const withHeight = characters.map((c) => ({ ...c, h: parseFloat((c.physicalHeight || "").replace(",", ".")) })).filter((c) => !isNaN(c.h));
  const [order, setOrder] = useState(withHeight.map((c) => c.id));
  const [selectedIds, setSelectedIds] = useState(withHeight.map((c) => c.id));
  const dragRef = useRef(null);
  const shown = order.filter((id) => selectedIds.includes(id)).map((id) => withHeight.find((c) => c.id === id)).filter(Boolean);
  function toggle(id) { setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); }
  if (withHeight.length === 0) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Añade la altura (en metros, ej. "1.75") en la ficha de un personaje para compararlas aquí.</div>;
  const pxPerM = 150;
  const maxH = Math.max(...withHeight.map((c) => c.h));
  function onDrop(id) { if (!dragRef.current || dragRef.current === id) return; const arr = [...order]; const from = arr.indexOf(dragRef.current), to = arr.indexOf(id); arr.splice(from, 1); arr.splice(to, 0, dragRef.current); setOrder(arr); dragRef.current = null; }
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>{withHeight.map((c) => <button key={c.id} onClick={() => toggle(c.id)} style={{ ...toggleBtn, padding: "3px 8px", fontSize: 11, ...(selectedIds.includes(c.id) ? toggleBtnActive : {}) }}>{c.name}</button>)}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, overflowX: "auto", paddingBottom: 4, borderBottom: "3px solid var(--border)" }}>
        {shown.map((c) => (
          <div key={c.id} draggable onDragStart={() => (dragRef.current = c.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(c.id)} style={{ textAlign: "center", flexShrink: 0, width: 84, cursor: "grab" }}>
            <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 4 }}>{c.h.toFixed(2)} m</div>
            <div style={{ width: 52, height: c.h * pxPerM, background: c.importance === "Principal" ? highlight : "var(--accent)", borderRadius: "8px 8px 0 0", margin: "0 auto", position: "relative" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", border: "2px solid var(--bg)", position: "absolute", top: -34, left: "50%", transform: "translateX(-50%)" }} />
            </div>
            <div style={{ fontSize: 11.5, marginTop: 4, width: 84, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.name}>{c.name}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 6 }}>Arrastra para reordenar. Todas las franjas parten de la misma línea base para comparar bien.</div>
    </div>
  );
}

function FamilyTree({ characters, onSelect, highlight }) {
  const byId = Object.fromEntries(characters.map((c) => [c.id, c]));
  const parentsOf = {}, childrenOf = {};
  characters.forEach((c) => (c.relationships || []).forEach((r) => { if (r.type === "padre") (parentsOf[c.id] = parentsOf[c.id] || []).push(r.targetId); if (r.type === "hijo") (childrenOf[c.id] = childrenOf[c.id] || []).push(r.targetId); }));
  const siblingsOf = {};
  characters.forEach((c) => (c.relationships || []).forEach((r) => { if (r.type === "hermano") (siblingsOf[c.id] = siblingsOf[c.id] || new Set()).add(r.targetId); }));

  // unidades familiares: agrupa hijos por el conjunto exacto de padres que comparten
  const units = {};
  Object.entries(childrenOf).forEach(([parentId, kids]) => kids.forEach((kid) => {
    const parents = (parentsOf[kid] || []).length ? parentsOf[kid] : [parentId];
    const key = [...parents].sort().join("+");
    if (!units[key]) units[key] = { parents, children: new Set() };
    units[key].children.add(kid);
  }));
  const allChildIds = new Set(Object.values(units).flatMap((u) => [...u.children]));
  const allParentIdsInUnits = new Set(Object.values(units).flatMap((u) => u.parents));
  const familyIds = new Set();
  characters.forEach((c) => (c.relationships || []).forEach((r) => { if (FAMILY_REL_KEYS.includes(r.type)) { familyIds.add(c.id); familyIds.add(r.targetId); } }));
  if (familyIds.size === 0) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Marca relaciones de "Es su padre/madre", "Es su hijo/a" o "Es su hermano/a" en las fichas para ver el árbol familiar.</div>;

  const rootUnits = Object.values(units).filter((u) => !u.parents.some((p) => allChildIds.has(p)));
  const orphanFamily = [...familyIds].filter((id) => !allChildIds.has(id) && !allParentIdsInUnits.has(id));

  function PersonBox({ id }) { const c = byId[id]; if (!c) return null; return (<button onClick={() => onSelect(id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "var(--bg2)", border: `1px solid ${c.importance === "Principal" ? highlight : "var(--border)"}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "var(--text)" }}><span style={{ width: 30, height: 30, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", display: "inline-block" }} /><span style={{ fontSize: 11.5 }}>{c.name}</span></button>); }

  function renderUnit(unit, seen) {
    const key = unit.parents.join("+");
    if (seen.has(key)) return null; seen.add(key);
    const kids = [...unit.children];
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{unit.parents.map((p, i) => (<div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>{i > 0 && <span style={{ color: "var(--dim)", fontSize: 16 }}>+</span>}<PersonBox id={p} /></div>))}</div>
        {kids.length > 0 && (<><div style={{ width: 1, height: 16, background: "var(--border)" }} /><div style={{ display: "flex", gap: 22, borderTop: "1px solid var(--border)", paddingTop: 14 }}>{kids.map((kid) => { const kidUnit = Object.values(units).find((u) => u.parents.length === 1 && u.parents[0] === kid || u.parents.includes(kid)); const ownUnit = Object.values(units).find((u) => u.parents.includes(kid)); return (<div key={kid} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{ownUnit ? renderUnit(ownUnit, seen) : <PersonBox id={kid} />}</div>); })}</div></>)}
      </div>
    );
  }
  const seen = new Set();
  return (
    <div>
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>{rootUnits.map((u, i) => <div key={i}>{renderUnit(u, seen)}</div>)}</div>
      {orphanFamily.length > 0 && (<div style={{ marginTop: 24 }}><div style={fieldLabel}>Hermanos sin hijos registrados</div><div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>{orphanFamily.map((id) => <PersonBox key={id} id={id} />)}</div></div>)}
    </div>
  );
}

function RelationshipWeb({ characters, onSelect, highlight, positions, setPositions }) {
  const w = 720, h = 480;
  const dragRef = useRef(null);
  const [zoomTarget, setZoomTarget] = useState(null);
  const [zoom, setZoom] = useState(1);
  const defaultPositions = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(characters.length || 1)); const rows = Math.ceil((characters.length || 1) / cols); const map = {};
    characters.forEach((c, i) => { const col = i % cols, row = Math.floor(i / cols); const jitterX = (hash(c.id + "x") % 30) - 15, jitterY = (hash(c.id + "y") % 30) - 15; map[c.id] = { x: ((col + 0.5) / cols) * (w - 80) + 40 + jitterX, y: ((row + 0.5) / rows) * (h - 80) + 40 + jitterY }; });
    return map;
  }, [characters]);
  const pos = (id) => positions[id] || defaultPositions[id] || { x: w / 2, y: h / 2 };
  function startDrag(e, id) { dragRef.current = { id, startX: e.clientX, startY: e.clientY, orig: pos(id) }; window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); }
  function onMove(e) { if (!dragRef.current) return; const { id, startX, startY, orig } = dragRef.current; setPositions({ ...positions, [id]: { x: orig.x + (e.clientX - startX) / zoom, y: orig.y + (e.clientY - startY) / zoom } }); }
  function onUp() { dragRef.current = null; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); }
  const pairLinks = {};
  characters.forEach((c) => (c.relationships || []).forEach((r) => { const key = [c.id, r.targetId].sort().join("-"); if (!pairLinks[key]) pairLinks[key] = []; if (!pairLinks[key].find((l) => l.type === r.type)) pairLinks[key].push({ from: c.id, to: r.targetId, type: r.type }); }));
  const focus = zoomTarget ? pos(zoomTarget) : { x: w / 2, y: h / 2 };
  const vbSize = w / zoom;
  const vbX = Math.max(0, Math.min(w - vbSize, focus.x - vbSize / 2));
  const vbY = Math.max(0, Math.min(h - vbSize, focus.y - vbSize / 2));

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}><button onClick={() => setZoom((z) => Math.max(1, z - 0.3))} style={iconBtn}><ZoomOut size={13} /></button><button onClick={() => setZoom((z) => Math.min(3, z + 0.3))} style={iconBtn}><ZoomIn size={13} /></button>{zoomTarget && <button onClick={() => { setZoomTarget(null); setZoom(1); }} style={smallOutlineBtn}>Ver todo</button>}</div>
        <svg width={w} height={h} viewBox={`${vbX} ${vbY} ${vbSize} ${vbSize}`} style={{ flexShrink: 0, maxWidth: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10 }}>
          {Object.values(pairLinks).map((links) => links.map((l, idx) => { const a = pos(l.from), b = pos(l.to); const conf = REL_TYPES[l.type] || REL_TYPES.amistad; const offset = (idx - (links.length - 1) / 2) * 5; const dx = b.y - a.y, dy = -(b.x - a.x), len = Math.hypot(dx, dy) || 1; const ox = (dx / len) * offset, oy = (dy / len) * offset; return <line key={l.type} x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke={conf.color} strokeWidth={1.8} opacity={0.85} />; }))}
          {characters.map((c) => { const p = pos(c.id); const isProtag = c.importance === "Principal"; return (<g key={c.id} onPointerDown={(e) => startDrag(e, c.id)} onClick={() => { onSelect(c.id); }} onDoubleClick={() => setZoomTarget(c.id)} style={{ cursor: "grab" }}><circle cx={p.x} cy={p.y} r={26} fill="var(--bg3)" stroke={isProtag ? highlight : "var(--accent)"} strokeWidth={isProtag ? 2.4 : 1.2} /><text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={11} fill={isProtag ? highlight : "var(--text)"} fontFamily="Fraunces, serif">{c.name.split(" ")[0]}</text></g>); })}
        </svg>
        <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 4 }}>Arrastra un personaje para moverlo (se guarda). Doble click para centrar el zoom en él.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
        <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 4 }}>Leyenda</div>
        {Object.entries(REL_TYPES).map(([key, v]) => <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text)" }}><span style={{ width: 18, height: 3, background: v.color, display: "inline-block", borderRadius: 2 }} /> {v.label}</div>)}
        {characters.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Añade personajes para ver la red.</div>}
      </div>
    </div>
  );
}

function LineageTree({ characters, onSelect, highlight }) {
  const withLineage = characters.filter((c) => c.lineageGroup && c.lineageGroup.trim());
  const groups = {}; withLineage.forEach((c) => { (groups[c.lineageGroup] = groups[c.lineageGroup] || []).push(c); });
  return (
    <div style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
      {Object.entries(groups).map(([group, members]) => {
        const byPower = {}; members.forEach((m) => { (byPower[m.powerLevel || 0] = byPower[m.powerLevel || 0] || []).push(m); });
        const levels = Object.keys(byPower).map(Number).sort((a, b) => b - a);
        return (<div key={group} style={{ textAlign: "center" }}><div style={{ width: 52, height: 52, borderRadius: 10, margin: "0 auto 8px", background: members[0]?.emblem ? `url(${members[0].emblem}) center/cover` : "var(--bg3)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>{!members[0]?.emblem && <ImageIcon size={16} color="var(--dim)" />}</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, marginBottom: 14 }}>{group}</div><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>{levels.map((lvl, li) => (<div key={lvl} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{li > 0 && <div style={{ width: 1, height: 14, background: "var(--border)", margin: "0 auto" }} />}<div style={{ fontSize: 9, color: "var(--dim)", marginBottom: 3 }}>Poder {lvl}</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>{byPower[lvl].map((c) => (<button key={c.id} onClick={() => onSelect(c.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: `1px solid ${c.importance === "Principal" ? highlight : "var(--border)"}`, borderRadius: 20, padding: "5px 12px 5px 5px", cursor: "pointer", color: c.importance === "Principal" ? highlight : "var(--text)" }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: c.photo ? `url(${c.photo}) center/cover` : "var(--bg3)", display: "inline-block" }} /><span style={{ fontSize: 12.5 }}>{c.name}</span>{c.isMilitary && c.militaryRank && <span style={{ fontSize: 9, color: "#C1594A" }}>· {c.militaryRank}</span>}</button>))}</div></div>))}</div></div>);
      })}
      {Object.keys(groups).length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Asigna una "familia / linaje / orden (casa)" en la ficha de un personaje para que aparezca aquí.</div>}
    </div>
  );
}

function CharacterPanel({ character, bookId, books, allChars, onClose, onUpdate, onAddRelationship, onRemoveRelationship, onDelete }) {
  const [newRelTarget, setNewRelTarget] = useState(""); const [newRelType, setNewRelType] = useState("amistad"); const [newRelNote, setNewRelNote] = useState("");
  const fileRef = useRef(null); const emblemRef = useRef(null);
  const set = (field) => (e) => onUpdate({ [field]: e.target.value });
  function addRelationship() { if (!newRelTarget) return; onAddRelationship(newRelTarget, newRelType, newRelNote); setNewRelTarget(""); setNewRelNote(""); }
  const otherChars = allChars.filter((c) => c.id !== character.id);
  const closeOnes = character.relationships.filter((r) => REL_TYPES[r.type]?.closeness === "buena" && !FAMILY_REL_KEYS.includes(r.type));
  const family = character.relationships.filter((r) => FAMILY_REL_KEYS.includes(r.type));
  const enemies = character.relationships.filter((r) => REL_TYPES[r.type]?.closeness === "mala");
  return (
    <Modal onClose={onClose}>
      <div style={{ maxHeight: "76vh", overflowY: "auto", width: 580, maxWidth: "88vw", marginRight: -22, paddingRight: 18 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
          <div onClick={() => fileRef.current.click()} style={{ width: 64, height: 64, borderRadius: "50%", background: character.photo ? `url(${character.photo}) center/cover` : "var(--bg3)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>{!character.photo && <ImageIcon size={18} color="var(--dim)" />}</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ photo: url }))} />
          <div style={{ flex: 1 }}>
            <input value={character.name} onChange={set("name")} placeholder="Nombre completo (editable)" style={{ ...titleInput, fontSize: 20, marginBottom: 6 }} />
            <input value={character.nickname} onChange={set("nickname")} placeholder="Apodo / cómo le llaman / nombre secreto" style={{ ...textInput, marginBottom: 6, fontStyle: "italic" }} />
            <input value={character.customFamilyTag} onChange={set("customFamilyTag")} placeholder="Etiqueta de grupo familiar personalizado (opcional)" style={{ ...textInput, marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><select value={character.importance} onChange={set("importance")} style={selectInput}>{IMPORTANCE.map((i) => <option key={i}>{i}</option>)}</select><select value={character.natureType} onChange={set("natureType")} style={selectInput}>{NATURE_TYPES.map((n) => <option key={n}>{n}</option>)}</select></div>
            {character.natureType !== "Humano" && (<div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}><select value={character.natureSubtype} onChange={set("natureSubtype")} style={selectInput}><option value="">Tipo de sobrenatural...</option>{NATURE_SUBTYPES.map((n) => <option key={n}>{n}</option>)}</select>{character.natureSubtype === "Otro" && <input value={character.natureSubtypeOther} onChange={set("natureSubtypeOther")} placeholder="¿Cuál?" style={{ ...textInput, width: 140 }} />}</div>)}
          </div>
          <div style={{ display: "flex", gap: 6 }}><button onClick={onDelete} style={iconBtn}><Trash2 size={14} /></button><button onClick={onClose} style={iconBtn}><X size={14} /></button></div>
        </div>
        <SectionTitle>Estado vital</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}><label style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 0 }}><input type="checkbox" checked={character.isDead} onChange={(e) => onUpdate({ isDead: e.target.checked })} /> <Skull size={12} /> Ha muerto</label>{character.isDead && (<><select value={character.deathBookId} onChange={set("deathBookId")} style={selectInput}><option value="">¿Cuándo?</option><option value="__before__">Antes de la saga</option>{books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}</select><input value={character.deathNote} onChange={set("deathNote")} placeholder="Nota sobre su muerte" style={{ ...textInput, width: 200 }} /></>)}</div>
        <SectionTitle>Naturaleza militar / noble</SectionTitle>
        <Row2><div><label style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><input type="checkbox" checked={character.isMilitary} onChange={(e) => onUpdate({ isMilitary: e.target.checked })} /> Es militar</label>{character.isMilitary && <select value={character.militaryRank} onChange={set("militaryRank")} style={{ ...selectInput, marginTop: 6, width: "100%" }}><option value="">Puesto...</option>{MILITARY_RANKS.map((r) => <option key={r}>{r}</option>)}</select>}</div><div><label style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><input type="checkbox" checked={character.isNoble} onChange={(e) => onUpdate({ isNoble: e.target.checked })} /> <Crown size={12} /> Es noble</label>{character.isNoble && <select value={character.nobleTitle} onChange={set("nobleTitle")} style={{ ...selectInput, marginTop: 6, width: "100%" }}><option value="">Título...</option>{NOBLE_TITLES.map((r) => <option key={r}>{r}</option>)}</select>}</div></Row2>
        <div style={{ marginBottom: 10 }}><div style={fieldLabel}>Escudo familiar / orden / militar</div><div onClick={() => emblemRef.current.click()} style={{ width: 40, height: 40, borderRadius: 6, background: character.emblem ? `url(${character.emblem}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{!character.emblem && <ImageIcon size={13} color="var(--dim)" />}</div><input ref={emblemRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ emblem: url }))} /></div>
        <SectionTitle>Identidad</SectionTitle>
        <Row2><Field label="Edad" value={character.age} onChange={(v) => onUpdate({ age: v })} /><Field label="Cumpleaños (MM-DD)" value={character.birthday} onChange={(v) => onUpdate({ birthday: v })} /></Row2>
        <Row2><Field label="Lugar de nacimiento" value={character.birthplace} onChange={(v) => onUpdate({ birthplace: v })} /><Field label="Situación civil" value={character.civilStatus} onChange={(v) => onUpdate({ civilStatus: v })} /></Row2>
        <Row2><Field label="Título / puesto" value={character.title} onChange={(v) => onUpdate({ title: v })} /><Field label="Trabajo o estudios" value={character.occupation} onChange={(v) => onUpdate({ occupation: v })} /></Row2>
        <Row2><Field label="Altura en metros (ej. 1.75, para comparar)" value={character.physicalHeight} onChange={(v) => onUpdate({ physicalHeight: v })} /><Field label="Familia / linaje / orden (casa)" value={character.lineageGroup} onChange={(v) => onUpdate({ lineageGroup: v })} /></Row2>
        <Row2><Field label="Nivel de poder (0-10, para el árbol de casas)" value={character.powerLevel} onChange={(v) => onUpdate({ powerLevel: Number(v) || 0 })} /><div /></Row2>
        <FieldArea label="Descripción física" value={character.physicalDesc} onChange={(v) => onUpdate({ physicalDesc: v })} />
        {character.natureType !== "Humano" && <><SectionTitle>Efecto de su naturaleza</SectionTitle><FieldArea label="Qué le afecta por ser así" value={character.natureEffect} onChange={(v) => onUpdate({ natureEffect: v })} /></>}
        <SectionTitle>Psicología</SectionTitle>
        <Field label="Rol en el libro" value={character.role} onChange={(v) => onUpdate({ role: v })} />
        <Field label="Motivación" value={character.motivation} onChange={(v) => onUpdate({ motivation: v })} />
        <Row2><Field label="Virtudes" value={character.virtues} onChange={(v) => onUpdate({ virtues: v })} /><Field label="Defectos" value={character.defects} onChange={(v) => onUpdate({ defects: v })} /></Row2>
        <Field label="Debilidad" value={character.weakness} onChange={(v) => onUpdate({ weakness: v })} />
        <FieldArea label="Personalidad" value={character.personality} onChange={(v) => onUpdate({ personality: v })} />
        <SectionTitle>Posesiones</SectionTitle>
        <Field label="Objetos que lleva encima" value={character.itemsCarried} onChange={(v) => onUpdate({ itemsCarried: v })} />
        <Field label="Objetos importantes en la trama" value={character.importantItems} onChange={(v) => onUpdate({ importantItems: v })} />
        <SectionTitle>Otros</SectionTitle>
        <Row2><Field label="Hobbies" value={character.hobbies} onChange={(v) => onUpdate({ hobbies: v })} /><Field label="Datos importantes" value={character.trivia} onChange={(v) => onUpdate({ trivia: v })} /></Row2>
        <SectionTitle>Rol por libro</SectionTitle>
        {books.map((b) => (<div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 12.5, width: 160, color: "var(--dim)" }}>{b.title}</span><select value={character.roleByBook[b.id] || ""} onChange={(e) => onUpdate({ roleByBook: { ...character.roleByBook, [b.id]: e.target.value } })} style={selectInput}><option value="">-</option><option>Protagonista</option><option>Secundario</option><option>Ocasional</option><option>Antagonista</option></select></div>))}
        <SectionTitle>Situación en este libro</SectionTitle>
        <textarea value={character.statusByBook[bookId] || ""} onChange={(e) => onUpdate({ statusByBook: { ...character.statusByBook, [bookId]: e.target.value } })} rows={2} style={textArea} />
        <SectionTitle>Familia (padres, hijos, hermanos)</SectionTitle>
        <RelList list={family} allChars={allChars} onRemove={(relId, targetId) => onRemoveRelationship(relId, targetId)} />
        <SectionTitle>Relaciones cercanas</SectionTitle>
        <RelList list={closeOnes} allChars={allChars} onRemove={(relId, targetId) => onRemoveRelationship(relId, targetId)} />
        <SectionTitle>Enemigos</SectionTitle>
        <RelList list={enemies} allChars={allChars} onRemove={(relId, targetId) => onRemoveRelationship(relId, targetId)} />
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}><select value={newRelTarget} onChange={(e) => setNewRelTarget(e.target.value)} style={selectInput}><option value="">Personaje...</option>{otherChars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={newRelType} onChange={(e) => setNewRelType(e.target.value)} style={selectInput}>{Object.entries(REL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select><button onClick={addRelationship} style={smallOutlineBtn}>+ Añadir (se actualiza en ambos)</button></div>
      </div>
    </Modal>
  );
}
function RelList({ list, allChars, onRemove }) { if (list.length === 0) return <div style={{ color: "var(--dim)", fontSize: 12, marginBottom: 10 }}>Ninguna todavía.</div>; return <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>{list.map((r) => { const target = allChars.find((c) => c.id === r.targetId); const conf = REL_TYPES[r.type]; return (<div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12.5, flexWrap: "wrap" }}><span style={{ color: conf.color, fontWeight: 600 }}>{conf.label}</span><span>→ {target?.name || "?"}</span>{r.note && <span style={{ color: "var(--dim)" }}>· {r.note}</span>}<button onClick={() => onRemove(r.id, r.targetId)} style={{ ...miniIconBtn, marginLeft: "auto" }}><X size={11} /></button></div>); })}</div>; }
function SectionTitle({ children }) { return <div style={{ fontSize: 11.5, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.6, margin: "16px 0 8px" }}>{children}</div>; }
function Row2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>; }
function Field({ label, value, onChange, custom, type }) { return <div style={{ marginBottom: 10 }}><div style={fieldLabel}>{label}</div>{custom || <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} style={textInput} />}</div>; }
function FieldArea({ label, value, onChange }) { return <div style={{ marginBottom: 10 }}><div style={fieldLabel}>{label}</div><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} style={textArea} /></div>; }

// ---------------- Estructura ----------------
function StructureTab({ bookId, chapters, setChapters, bookActs, setBookActs }) {
  const acts = bookActs[bookId] || [];
  const bookChapters = useMemo(() => chapters.filter((c) => c.bookId === bookId).sort((a, b) => a.order - b.order), [chapters, bookId]);
  const [showLegend, setShowLegend] = useState(true);
  const ACT_PALETTE = ["#6E93C9", "#C9A24B", "#C1594A", "#5FA98C", "#7A5EA8", "#C06E97"];
  function addAct() { const name = prompt("Nombre del acto:", `Acto ${acts.length + 1}`); if (!name) return; setBookActs((a) => ({ ...a, [bookId]: [...acts, { id: uid(), name, color: ACT_PALETTE[acts.length % ACT_PALETTE.length], startOrder: bookChapters.length }] })); }
  function renameAct(id) { const act = acts.find((a) => a.id === id); const name = prompt("Nuevo nombre del acto:", act?.name); if (!name) return; setBookActs((a) => ({ ...a, [bookId]: acts.map((x) => (x.id === id ? { ...x, name } : x)) })); }
  function removeAct(id) { if (acts.length <= 1) return alert("Debe haber al menos un acto."); setBookActs((a) => ({ ...a, [bookId]: acts.filter((x) => x.id !== id) })); }
  function setActStart(actId, chapterOrder) { setBookActs((a) => ({ ...a, [bookId]: acts.map((x) => (x.id === actId ? { ...x, startOrder: chapterOrder } : x)) })); }
  function updateChapter(id, patch) { setChapters((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))); }
  const sortedActs = [...acts].sort((a, b) => a.startOrder - b.startOrder);
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 300 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={fieldLabel}>Evolución de la tensión narrativa — se ve completa de inicio a fin, se ajusta al ancho disponible</div><button onClick={() => setShowLegend((v) => !v)} style={smallOutlineBtn}>{showLegend ? "Ocultar" : "Mostrar"} significado de niveles</button></div>
        <TensionChart chapters={bookChapters} acts={acts} />
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "16px 0 10px" }}><button onClick={addAct} style={smallOutlineBtn}>+ Añadir acto</button></div>
        <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10 }}>Elige en qué capítulo empieza cada acto — todos los capítulos siguientes se reasignan automáticamente hasta el próximo acto.</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(acts.length, 1)}, 1fr)`, gap: 16 }}>
          {sortedActs.map((act, actIdx) => { const nextStart = sortedActs[actIdx + 1]?.startOrder ?? Infinity; const actChapters = bookChapters.filter((c) => c.order >= act.startOrder && c.order < nextStart); return (
            <div key={act.id} style={{ background: "var(--bg2)", border: `1px solid var(--border)`, borderTop: `3px solid ${act.color}`, borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div onClick={() => renameAct(act.id)} style={{ fontFamily: "'Fraunces', serif", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} title="Click para renombrar">{act.name} <Pencil size={11} color="var(--dim)" /></div>{acts.length > 1 && <button onClick={() => removeAct(act.id)} style={miniIconBtn}><X size={12} /></button>}</div>
              {actIdx === 0 ? <div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 8 }}>Siempre empieza en el capítulo 1</div> : <select value={act.startOrder} onChange={(e) => setActStart(act.id, Number(e.target.value))} style={{ ...selectInput, width: "100%", marginBottom: 8 }}>{bookChapters.map((c, i) => <option key={c.id} value={c.order}>Empieza en: {i + 1}. {c.title}</option>)}</select>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{actChapters.map((c) => (<div key={c.id} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}><div style={{ fontSize: 13, marginBottom: 6 }}>{c.title}</div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="range" min={1} max={5} value={c.tension} onChange={(e) => updateChapter(c.id, { tension: Number(e.target.value) })} style={{ flex: 1 }} /><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent)" }}>{c.tension}</span></div></div>))}{actChapters.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin capítulos.</div>}</div>
            </div>
          ); })}
        </div>
      </div>
      {showLegend && (<div style={{ width: 230, flexShrink: 0 }}><div style={fieldLabel}>¿Qué significa cada nivel?</div><div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>{TENSION_LEVELS.map((t) => (<div key={t.level} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)", fontWeight: 700 }}>{t.level}</span><span style={{ fontSize: 12.5, fontWeight: 600 }}>{t.label}</span></div><div style={{ fontSize: 11.5, color: "var(--dim)" }}>{t.desc}</div></div>))}</div></div>)}
    </div>
  );
}
function TensionChart({ chapters, acts }) {
  const vw = 800, h = 140, pad = 26;
  if (chapters.length === 0) return <div style={{ color: "var(--dim)", fontSize: 12.5 }}>Añade capítulos para ver la evolución.</div>;
  const step = (vw - pad * 2) / Math.max(chapters.length - 1, 1);
  const pts = chapters.map((c, i) => ({ x: pad + i * step, y: h - pad - ((c.tension - 1) / 4) * (h - pad * 2), act: actForOrder(c.order, acts), title: c.title, tension: c.tension }));
  const actColor = (act) => act?.color || "var(--accent)";
  return (<svg width="100%" height={h} viewBox={`0 0 ${vw} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>{pts.slice(1).map((p, i) => { const from = pts[i]; if (from.act?.id === p.act?.id) return <line key={i} x1={from.x} y1={from.y} x2={p.x} y2={p.y} stroke={actColor(from.act)} strokeWidth={2.5} />; const midX = (from.x + p.x) / 2, midY = (from.y + p.y) / 2; return (<g key={i}><line x1={from.x} y1={from.y} x2={midX} y2={midY} stroke={actColor(from.act)} strokeWidth={2.5} /><line x1={midX} y1={midY} x2={p.x} y2={p.y} stroke={actColor(p.act)} strokeWidth={2.5} /></g>); })}{pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={actColor(p.act)}><title>{`${p.title} · tensión ${p.tension}`}</title></circle>)}</svg>);
}

// ---------------- Calendario ----------------
function CalendarTab({ sagaId, characters, events, setEvents }) {
  const sagaEvents = events.filter((e) => e.sagaId === sagaId);
  const sagaChars = characters.filter((c) => c.sagaId === sagaId && c.birthday);
  const [hover, setHover] = useState(null);
  const [visibleCats, setVisibleCats] = useState(Object.keys(EVENT_CATEGORIES));
  function toggleCat(k) { setVisibleCats((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k])); }
  function addEvent() { const title = prompt("Nombre del evento:"); if (!title) return; const month = Number(prompt("Mes (1-12):", "1")) || 1; const day = Number(prompt("Día del mes:", "1")) || 1; const category = prompt(`Categoría (${Object.keys(EVENT_CATEGORIES).join(", ")}):`, "politica_interior") || "politica_interior"; const continuous = confirm("¿Es un evento continuo (ej. una guerra)?"); const annual = confirm("¿Se repite cada año?"); setEvents((ev) => [...ev, { id: uid(), sagaId, title, category: EVENT_CATEGORIES[category] ? category : "politica_interior", month, day, continuous, annual }]); }
  const filteredEvents = sagaEvents.filter((e) => visibleCats.includes(e.category));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{Object.entries(EVENT_CATEGORIES).map(([k, v]) => <button key={k} onClick={() => toggleCat(k)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: visibleCats.includes(k) ? "var(--text)" : "var(--dim)", background: "none", border: "none", cursor: "pointer", opacity: visibleCats.includes(k) ? 1 : 0.4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: v.color }} />{v.label}</button>)}</div>
        <button onClick={addEvent} style={primaryBtn}><Plus size={13} /> Nuevo evento</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {MONTHS.map((mLabel, mi) => { const month = mi + 1; const daysInMonth = MONTH_DAYS[mi]; const monthEvents = filteredEvents.filter((e) => e.month === month || e.annual); const bdays = sagaChars.filter((c) => Number(c.birthday.split("-")[0]) === month); return (
          <div key={mLabel} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 11.5, color: "var(--dim)", marginBottom: 6, textTransform: "uppercase" }}>{mLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>{Array.from({ length: daysInMonth }, (_, di) => { const day = di + 1; const dayEvents = monthEvents.filter((e) => e.day === day); const dayBdays = bdays.filter((c) => Number(c.birthday.split("-")[1]) === day); const has = dayEvents.length > 0 || dayBdays.length > 0; const key = `${mLabel}-${day}`; return (<div key={day} onMouseEnter={() => has && setHover({ key, month: mLabel, day, events: dayEvents, bdays: dayBdays })} onMouseLeave={() => setHover((h) => (h?.key === key ? null : h))} style={{ position: "relative", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, borderRadius: 3, background: has ? (dayEvents[0] ? EVENT_CATEGORIES[dayEvents[0].category].color + "33" : "var(--accent)33") : "var(--bg3)", color: has ? "var(--text)" : "var(--dim)", cursor: has ? "pointer" : "default" }}>{day}{dayEvents.length > 0 && <span style={{ position: "absolute", top: -1, right: -1, width: 4, height: 4, borderRadius: "50%", background: EVENT_CATEGORIES[dayEvents[0].category].color }} />}{dayBdays.length > 0 && <span style={{ position: "absolute", bottom: -1, right: -1, fontSize: 6 }}>🎂</span>}</div>); })}</div>
            {hover && hover.month === mLabel && (<div style={{ marginTop: 6, fontSize: 9.5, color: "var(--text)", borderTop: "1px solid var(--border)", paddingTop: 4 }}><div style={{ color: "var(--dim)" }}>Día {hover.day}</div>{hover.events.map((e) => <div key={e.id} style={{ color: EVENT_CATEGORIES[e.category].color }}>● {e.title}</div>)}{hover.bdays.map((c) => <div key={c.id}>🎂 {c.name}</div>)}</div>)}
          </div>
        ); })}
      </div>
    </div>
  );
}

// ---------------- Línea de aparición ----------------
function AppearanceTab({ sagaId, books, chapters, characters, appearances, setAppearances }) {
  const sagaChapters = useMemo(() => chapters.filter((c) => books.some((b) => b.id === c.bookId)).sort((a, b) => { const ba = books.findIndex((x) => x.id === a.bookId), bb = books.findIndex((x) => x.id === b.bookId); return ba - bb || a.order - b.order; }), [chapters, books]);
  const sagaChars = characters.filter((c) => c.sagaId === sagaId);
  const sagaAppearances = appearances.filter((a) => a.sagaId === sagaId);
  function addAppearance(chapterId) { const name = prompt(`¿Qué personaje aparece por primera vez aquí?\n${sagaChars.map((c) => c.name).join(", ")}`); const character = sagaChars.find((c) => c.name === name); if (!character) return; const category = prompt(`Categoría (${Object.keys(APPEARANCE_CATEGORIES).join(", ")}):`, "cultura") || "cultura"; setAppearances((a) => [...a, { id: uid(), sagaId, characterId: character.id, chapterId, category: APPEARANCE_CATEGORIES[category] ? category : "cultura" }]); }
  const colW = 90; const cats = Object.keys(APPEARANCE_CATEGORIES); const laneH = 58;
  return (
    <div>
      <div style={fieldLabel}>Primera aparición de personajes — la numeración se reinicia en cada libro; pueden aparecer varios en la misma casilla (desplaza a la derecha)</div>
      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <div style={{ width: sagaChapters.length * colW + 70, minWidth: "100%" }}>
          <div style={{ display: "flex", marginLeft: 70 }}>{books.map((book) => { const bookChs = sagaChapters.filter((c) => c.bookId === book.id); if (bookChs.length === 0) return null; return <div key={book.id} style={{ width: bookChs.length * colW, background: book.color + "33", borderBottom: `2px solid ${book.color}`, textAlign: "center", padding: "3px 0", fontSize: 10.5, color: "var(--text)", fontWeight: 600, flexShrink: 0 }}>{book.title}</div>; })}</div>
          <div style={{ display: "flex", marginLeft: 70, marginTop: 4 }}>{books.map((book) => sagaChapters.filter((c) => c.bookId === book.id).map((c, i) => (<div key={c.id} onClick={() => addAppearance(c.id)} style={{ width: colW, flexShrink: 0, cursor: "pointer", padding: "4px 4px", borderLeft: "1px solid var(--border)", textAlign: "center" }} title={`${book.title} · ${c.title}`}><div style={{ fontSize: 12, color: "var(--text)", fontFamily: "'JetBrains Mono', monospace" }}>#{i + 1}</div></div>)))}</div>
          {cats.map((cat) => (<div key={cat} style={{ display: "flex", alignItems: "center", height: laneH, borderTop: "1px solid var(--border)" }}><div style={{ width: 70, fontSize: 9.5, color: APPEARANCE_CATEGORIES[cat].color, flexShrink: 0 }}>{APPEARANCE_CATEGORIES[cat].label}</div>{sagaChapters.map((c) => { const apps = sagaAppearances.filter((a) => a.chapterId === c.id && a.category === cat); return (<div key={c.id} style={{ width: colW, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>{apps.map((app) => { const char = sagaChars.find((x) => x.id === app.characterId); if (!char) return null; return (<div key={app.id} style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 14, height: 14, borderRadius: 4, transform: "rotate(45deg)", background: char.photo ? `url(${char.photo}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", flexShrink: 0 }} /><span style={{ fontSize: 9.5, color: "var(--text)", whiteSpace: "nowrap" }}>{char.name.split(" ")[0]}</span></div>); })}</div>); })}</div>))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Línea temporal (in-story) ----------------
function dateToPos(year, month, day) { if (year == null) return null; return year * 12 + (month || 1) + (day ? (day - 1) / 31 : 0); }
function StoryTimelineTab({ sagaId, books, setBooks, storyEvents, setStoryEvents, characters, eraConfig, setEraConfig }) {
  const sagaEvents = storyEvents.filter((e) => e.sagaId === sagaId).sort((a, b) => (a.yearOffset * 12 + a.month) - (b.yearOffset * 12 + b.month) || a.day - b.day);
  const era = eraConfig || { startYear: 0, suffix: "" };
  const [zoom, setZoom] = useState(1);
  function addEvent() { const title = prompt("¿Qué ocurre?"); if (!title) return; const yearOffset = Number(prompt("Años desde el inicio de la historia (puede ser 1, 2, 10...):", "0")) || 0; const month = Number(prompt("Mes (1-12):", "1")) || 1; const day = Number(prompt("Día:", "1")) || 1; const category = prompt(`Etiqueta (${Object.keys(EVENT_CATEGORIES).join(", ")}):`, "politica_interior") || "politica_interior"; setStoryEvents((e) => [...e, { id: uid(), sagaId, order: sagaEvents.length, yearOffset, month, day, category: EVENT_CATEGORIES[category] ? category : "politica_interior", title, description: "", highlightFor: [] }]); }
  function updateEvent(id, patch) { setStoryEvents((e) => e.map((x) => (x.id === id ? { ...x, ...patch } : x))); }
  function toggleHighlight(id, charId) { const ev = storyEvents.find((e) => e.id === id); const has = (ev.highlightFor || []).includes(charId); updateEvent(id, { highlightFor: has ? ev.highlightFor.filter((x) => x !== charId) : [...(ev.highlightFor || []), charId] }); }
  function updateBook(id, patch) { setBooks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b))); }
  const booksWithSpan = books.filter((b) => b.narrativeStartYear != null && b.narrativeEndYear != null).map((b) => ({ ...b, startPos: dateToPos(b.narrativeStartYear, b.narrativeStartMonth, b.narrativeStartDay), endPos: dateToPos(b.narrativeEndYear, b.narrativeEndMonth, b.narrativeEndDay) }));
  const positions = [...sagaEvents.map((e) => e.yearOffset * 12 + e.month), ...booksWithSpan.map((b) => b.startPos), ...booksWithSpan.map((b) => b.endPos)];
  const minPos = positions.length ? Math.min(...positions) : 0; const maxPos = positions.length ? Math.max(...positions) : 24; const span = Math.max(maxPos - minPos, 12);
  const colWidth = 80 * zoom; const totalMonths = span + 6;
  function labelYear(yearOffset) { return `${era.startYear + yearOffset} ${era.suffix}`.trim(); }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}><div style={fieldLabel}>Cronología dentro de la historia (se adapta a cuántos años abarquen los eventos)</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))} style={iconBtn}><ZoomOut size={13} /></button><button onClick={() => setZoom((z) => Math.min(3, z + 0.2))} style={iconBtn}><ZoomIn size={13} /></button><button onClick={addEvent} style={smallOutlineBtn}>+ Añadir acontecimiento</button></div></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}><span style={fieldLabel}>Año de inicio de la historia</span><input type="number" value={era.startYear} onChange={(e) => setEraConfig({ startYear: Number(e.target.value) || 0 })} style={{ ...textInput, width: 90 }} /><input value={era.suffix} onChange={(e) => setEraConfig({ suffix: e.target.value })} placeholder="Sufijo (ej. a.f.s)" style={{ ...textInput, width: 130 }} /><span style={{ fontSize: 11.5, color: "var(--dim)" }}>Ej: {era.startYear || 0} {era.suffix}</span></div>
      <div style={{ overflowX: "auto", marginBottom: 24, border: "1px solid var(--border)", borderRadius: 10, padding: "20px 0", background: "var(--bg2)", width: "100%" }}>
        <div style={{ position: "relative", width: Math.max(totalMonths * colWidth, 700), minHeight: 340 }}>
          <div style={{ position: "absolute", top: 170, left: 0, right: 0, height: 2, background: "var(--border)" }} />
          {Array.from({ length: totalMonths }, (_, i) => { const absMonth = minPos - 3 + i; const yearOffset = Math.floor((absMonth - 1) / 12); const monthInYear = ((absMonth - 1) % 12 + 12) % 12; const isJan = monthInYear === 0; return (<div key={i} style={{ position: "absolute", left: i * colWidth, top: 160, width: colWidth, textAlign: "center" }}><div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 auto" }} /><div style={{ fontSize: 9.5, color: isJan ? "var(--accent)" : "var(--dim)", marginTop: 2, fontWeight: isJan ? 700 : 400 }}>{MONTHS[monthInYear]}</div>{isJan && <div style={{ fontSize: 9, color: "var(--accent)" }}>{labelYear(yearOffset)}</div>}</div>); })}
          {booksWithSpan.map((b, bi) => { const x1 = (b.startPos - (minPos - 3)) * colWidth, x2 = (b.endPos - (minPos - 3)) * colWidth; return <div key={b.id} style={{ position: "absolute", left: x1, top: 130 - bi * 24, width: Math.max(x2 - x1, 10), height: 18, background: b.color + "55", border: `1px solid ${b.color}`, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 9.5, color: "var(--text)", overflow: "hidden", whiteSpace: "nowrap" }} title={`${b.title}`}>{b.title}</div>; })}
          {sagaEvents.map((e) => { const pos = e.yearOffset * 12 + e.month; const x = (pos - (minPos - 3)) * colWidth; const chars = (e.highlightFor || []).map((id) => characters.find((c) => c.id === id)).filter(Boolean); return (<div key={e.id} style={{ position: "absolute", left: x - 60, top: 190, width: 140 }}><div style={{ width: 1, height: 16, background: EVENT_CATEGORIES[e.category].color, margin: "0 auto" }} /><div style={{ background: "var(--bg3)", border: `1px solid ${EVENT_CATEGORIES[e.category].color}55`, borderTop: `3px solid ${EVENT_CATEGORIES[e.category].color}`, borderRadius: 6, padding: "6px 8px", fontSize: 10, lineHeight: 1.35 }}><div style={{ color: "var(--text)", fontWeight: 600, marginBottom: 2 }}>{e.title}</div>{e.description && <div style={{ color: "var(--dim)", fontSize: 9.5 }}>{e.description}</div>}{chars.length > 0 && <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 3, color: "var(--accent)" }}><Star size={9} /> {chars.map((c) => c.name).join(", ")}</div>}</div></div>); })}
          {sagaEvents.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12, position: "absolute", left: 20, top: 190 }}>Sin acontecimientos aún.</div>}
        </div>
      </div>
      <div style={fieldLabel}>Detalle de acontecimientos</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, marginBottom: 20 }}>{sagaEvents.map((e) => (<div key={e.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 6 }}><span style={{ fontWeight: 600 }}>{e.title}</span><select value={e.category} onChange={(ev) => updateEvent(e.id, { category: ev.target.value })} style={{ ...selectInput, color: EVENT_CATEGORIES[e.category].color }}>{Object.entries(EVENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select><span style={{ fontSize: 10.5, color: "var(--dim)" }}>{labelYear(e.yearOffset)} · {MONTHS[e.month - 1]} {e.day}</span></div><textarea value={e.description} onChange={(ev) => updateEvent(e.id, { description: ev.target.value })} rows={2} placeholder="Descripción completa del acontecimiento..." style={{ ...textArea, fontSize: 12, marginBottom: 6 }} /><div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 4 }}>Marcar como remarcable para:</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{characters.map((c) => <button key={c.id} onClick={() => toggleHighlight(e.id, c.id)} style={{ ...toggleBtn, padding: "3px 8px", fontSize: 10.5, ...((e.highlightFor || []).includes(c.id) ? toggleBtnActive : {}) }}><Star size={9} /> {c.name}</button>)}</div></div>))}</div>
      <div style={fieldLabel}>Cuándo empieza y termina narrativamente cada libro (día, mes y año; dos libros pueden solaparse)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>{books.map((b) => (<div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: `1px solid ${b.color}55`, borderLeft: `3px solid ${b.color}`, borderRadius: 8, padding: "8px 10px", flexWrap: "wrap" }}><span style={{ fontSize: 12.5, width: 130 }}>{b.title}</span><span style={{ fontSize: 10, color: "var(--dim)" }}>Empieza — Año</span><input type="number" value={b.narrativeStartYear ?? ""} onChange={(e) => updateBook(b.id, { narrativeStartYear: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 55 }} /><span style={{ fontSize: 10, color: "var(--dim)" }}>Mes</span><input type="number" min={1} max={12} value={b.narrativeStartMonth ?? ""} onChange={(e) => updateBook(b.id, { narrativeStartMonth: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} /><span style={{ fontSize: 10, color: "var(--dim)" }}>Día</span><input type="number" min={1} max={31} value={b.narrativeStartDay ?? ""} onChange={(e) => updateBook(b.id, { narrativeStartDay: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} /><span style={{ fontSize: 10, color: "var(--dim)" }}>Termina — Año</span><input type="number" value={b.narrativeEndYear ?? ""} onChange={(e) => updateBook(b.id, { narrativeEndYear: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 55 }} /><span style={{ fontSize: 10, color: "var(--dim)" }}>Mes</span><input type="number" min={1} max={12} value={b.narrativeEndMonth ?? ""} onChange={(e) => updateBook(b.id, { narrativeEndMonth: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} /><span style={{ fontSize: 10, color: "var(--dim)" }}>Día</span><input type="number" min={1} max={31} value={b.narrativeEndDay ?? ""} onChange={(e) => updateBook(b.id, { narrativeEndDay: e.target.value ? Number(e.target.value) : null })} style={{ ...textInput, width: 45 }} /></div>))}</div>
    </div>
  );
}

// ---------------- Localización (con sub-sitios y salas) ----------------
function LocationTab({ sagaId, books, chapters, characters, universeEntries, setUniverseEntries, locations, setLocations, borders, setBorders }) {
  const places = universeEntries.filter((u) => u.sagaId === sagaId && u.category === "Lugares");
  const sagaChapters = useMemo(() => chapters.filter((c) => books.some((b) => b.id === c.bookId)).sort((a, b) => { const ba = books.findIndex((x) => x.id === a.bookId), bb = books.findIndex((x) => x.id === b.bookId); return ba - bb || a.order - b.order; }), [chapters, books]);
  const [chapterId, setChapterId] = useState(sagaChapters[0]?.id || "");
  const [addPlaceId, setAddPlaceId] = useState(""); const [addCharId, setAddCharId] = useState("");
  const [editingBorderId, setEditingBorderId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [focusPlaceId, setFocusPlaceId] = useState(null); // lugar top-level enfocado (zoom manual)
  const [drillId, setDrillId] = useState(null); // id del lugar en el que "hemos entrado" (subsitio/sala)
  useEffect(() => { if (!sagaChapters.find((c) => c.id === chapterId)) setChapterId(sagaChapters[0]?.id || ""); }, [sagaChapters]); // eslint-disable-line

  // auto-copia de la localización del capítulo anterior si este aún no tiene nada
  useEffect(() => {
    if (!chapterId) return;
    const already = locations.some((l) => l.chapterId === chapterId && l.sagaId === sagaId);
    if (already) return;
    const idx = sagaChapters.findIndex((c) => c.id === chapterId);
    if (idx <= 0) return;
    const prevId = sagaChapters[idx - 1].id;
    const prevLocs = locations.filter((l) => l.chapterId === prevId && l.sagaId === sagaId);
    if (prevLocs.length > 0) setLocations((ls) => [...ls, ...prevLocs.map((l) => ({ id: uid(), sagaId, chapterId, characterId: l.characterId, placeId: l.placeId }))]);
  }, [chapterId]); // eslint-disable-line

  const chapterLocations = locations.filter((l) => l.chapterId === chapterId && l.sagaId === sagaId);
  function assign() { if (!addPlaceId || !addCharId) return; setLocations((ls) => [...ls.filter((l) => !(l.chapterId === chapterId && l.characterId === addCharId)), { id: uid(), sagaId, chapterId, characterId: addCharId, placeId: addPlaceId }]); setAddCharId(""); }
  function remove(id) { setLocations((ls) => ls.filter((l) => l.id !== id)); }
  function addSublevel(parentId) { const name = prompt(parentId ? "Nombre del sub-sitio/sala:" : "Nombre del lugar:"); if (!name) return; setUniverseEntries((u) => [...u, { id: uid(), sagaId, category: "Lugares", title: name, content: "", tags: [], parentId, localX: 30 + Math.random() * 40, localY: 30 + Math.random() * 40, north: 5, south: 5, east: 5, west: 5, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" }]); }

  const drillPlace = drillId ? places.find((p) => p.id === drillId) : null;
  const levelPlaces = drillId ? places.filter((p) => p.parentId === drillId) : places.filter((p) => !p.parentId);
  const size = 640;
  const cx = size / 2, cy = size / 2, scale = 24;
  function topPos(p) { return { x: cx + ((p.east || 0) - (p.west || 0)) / 2 * scale / 2, y: cy - ((p.north || 0) - (p.south || 0)) / 2 * scale / 2 }; }
  function localPos(p) { return { x: (p.localX || 50) / 100 * size, y: (p.localY || 50) / 100 * size }; }
  const posFor = drillId ? localPos : topPos;

  function charsAtDisplay(place) {
    // si estamos en el mapa general, agrupa a quien esté en cualquier descendiente de este lugar
    if (!drillId) return chapterLocations.filter((l) => rootPlaceId(l.placeId, places) === place.id).map((l) => characters.find((c) => c.id === l.characterId)).filter(Boolean);
    return chapterLocations.filter((l) => l.placeId === place.id).map((l) => characters.find((c) => c.id === l.characterId)).filter(Boolean);
  }
  const directHereChars = drillId ? chapterLocations.filter((l) => l.placeId === drillId).map((l) => characters.find((c) => c.id === l.characterId)).filter(Boolean) : [];

  const activeBorders = editingBorderId ? borders : borders;
  function addBorder() { const name = prompt("Nombre de esta frontera/reino:", "Nuevo reino"); if (!name) return; const color = COLOR_PRESETS[borders.length % COLOR_PRESETS.length]; const nb = { id: uid(), name, color, points: [] }; setBorders([...borders, nb]); setEditingBorderId(nb.id); }
  function handleCanvasClick(e) { if (!editingBorderId) return; const rect = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - rect.left) / rect.width) * 100; const y = ((e.clientY - rect.top) / rect.height) * 100; setBorders(borders.map((b) => (b.id === editingBorderId ? { ...b, points: [...b.points, [x, y]] } : b))); }
  function removeBorder(id) { setBorders(borders.filter((b) => b.id !== id)); if (editingBorderId === id) setEditingBorderId(null); }
  const editingBorder = borders.find((b) => b.id === editingBorderId);

  const focusPos = focusPlaceId ? posFor(places.find((p) => p.id === focusPlaceId) || {}) : null;
  const vbSize = size / zoom;
  const vbX = focusPos ? Math.max(0, Math.min(size - vbSize, focusPos.x - vbSize / 2)) : 0;
  const vbY = focusPos ? Math.max(0, Math.min(size - vbSize, focusPos.y - vbSize / 2)) : 0;

  const assignOptions = drillId ? levelPlaces.concat(drillPlace ? [drillPlace] : []) : places;

  return (
    <div>
      <div style={fieldLabel}>Dónde está cada personaje, capítulo a capítulo</div>
      <div style={{ display: "flex", gap: 8, margin: "8px 0 10px", alignItems: "center", flexWrap: "wrap" }}>
        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} style={selectInput}>{sagaChapters.map((c, i) => <option key={c.id} value={c.id}>Cap. {i + 1}: {c.title}</option>)}</select>
        <span style={{ fontSize: 10.5, color: "var(--dim)" }}>(se copia automáticamente del capítulo anterior si está vacío)</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        {borders.map((b) => (<div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg2)", border: `1px solid ${b.color}`, borderRadius: 6, padding: "3px 8px", fontSize: 11 }}><span style={{ color: b.color }}>{b.name}</span><button onClick={() => setEditingBorderId(editingBorderId === b.id ? null : b.id)} style={{ ...miniIconBtn }}><Pencil size={10} /></button><button onClick={() => removeBorder(b.id)} style={miniIconBtn}><X size={10} /></button></div>))}
        <button onClick={addBorder} style={smallOutlineBtn}>+ Nueva frontera</button>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}><button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} style={iconBtn}><ZoomOut size={13} /></button><span style={{ fontSize: 11, color: "var(--dim)", width: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((z) => Math.min(4, z + 0.25))} style={iconBtn}><ZoomIn size={13} /></button></div>
      </div>
      {editingBorderId && <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>Editando "{editingBorder?.name}": haz click en el mapa para añadir puntos de esta frontera, en orden.</div>}
      {drillId && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><button onClick={() => setDrillId(null)} style={smallOutlineBtn}><ArrowLeft size={12} /> Volver al mapa general</button><span style={{ fontSize: 12, color: "var(--dim)" }}>Dentro de: <b style={{ color: "var(--text)" }}>{drillPlace?.title}</b></span></div>}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ overflow: "auto", maxWidth: "100%", maxHeight: 560, border: "1px solid var(--border)", borderRadius: 10 }}>
          <svg width={size * zoom} height={size * zoom} viewBox={focusPlaceId ? `${vbX} ${vbY} ${vbSize} ${vbSize}` : `0 0 ${size} ${size}`} onClick={handleCanvasClick} style={{ background: "var(--bg2)", cursor: editingBorderId ? "crosshair" : "default", display: "block" }}>
            {!drillId && borders.map((b) => b.points.length >= 3 && <polygon key={b.id} points={b.points.map(([px, py]) => `${px / 100 * size},${py / 100 * size}`).join(" ")} fill={b.color} fillOpacity={0.06} stroke={b.color} strokeWidth={1.4} strokeDasharray="5 3" />)}
            {!drillId && editingBorder && editingBorder.points.length > 0 && editingBorder.points.length < 3 && editingBorder.points.map(([px, py], i) => <circle key={i} cx={px / 100 * size} cy={py / 100 * size} r={4} fill={editingBorder.color} />)}
            {levelPlaces.map((p) => {
              const { x, y } = posFor(p);
              const outside = !drillId && borders.length > 0 ? !borders.some((b) => b.points.length >= 3 && pointInPolygon([x, y], b.points.map(([px, py]) => [px / 100 * size, py / 100 * size]))) : false;
              const here = charsAtDisplay(p);
              const hasChildren = places.some((x2) => x2.parentId === p.id);
              const r = drillId ? 22 : 20;
              return (
                <g key={p.id}>
                  {p.isIsland && <circle cx={x} cy={y} r={r + 10} fill="#4FB8C955" />}
                  <circle cx={x} cy={y} r={r} fill="var(--bg3)" stroke={outside ? "#C1594A" : "var(--accent)"} strokeWidth={1.8} onClick={(e) => { e.stopPropagation(); if (hasChildren) setDrillId(p.id); else setFocusPlaceId(p.id); }} style={{ cursor: hasChildren ? "zoom-in" : "pointer" }} />
                  <text x={x} y={y - 2} textAnchor="middle" fontSize={8.5} fill={outside ? "#C1594A" : "var(--text)"} style={{ pointerEvents: "none" }}>{p.title.length > 12 ? p.title.slice(0, 11) + "…" : p.title}<title>{p.title}</title></text>
                  {p.isCapital && <Landmark x={x - 6} y={y + 3} width={9} height={9} color="var(--accent)" style={{ pointerEvents: "none" }} />}
                  {p.isImportantCourt && <Crown x={x - 2} y={y + 3} width={9} height={9} color="#C9A24B" style={{ pointerEvents: "none" }} />}
                  {here.map((ch, i) => { const ang = (i / Math.max(here.length, 1)) * 2 * Math.PI; const ox = (r + 12) * Math.cos(ang), oy = (r + 12) * Math.sin(ang); return (<g key={ch.id}><circle cx={x + ox} cy={y + oy} r={7} fill={colorForReader(ch.name)} stroke="var(--bg)" strokeWidth={1.3} /><text x={x + ox} y={y + oy + 3} textAnchor="middle" fontSize={7.5} fill="#fff" style={{ pointerEvents: "none" }}>{ch.name.charAt(0)}</text></g>); })}
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          {drillId && directHereChars.length > 0 && <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 8 }}>Directamente en "{drillPlace.title}" (fuera de sus sub-sitios): {directHereChars.map((c) => c.name).join(", ")}</div>}
          <div style={fieldLabel}>Personajes en este capítulo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {chapterLocations.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Nadie asignado todavía.</div>}
            {chapterLocations.map((l) => { const char = characters.find((c) => c.id === l.characterId), place = places.find((p) => p.id === l.placeId); return (<div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 12.5 }}><span style={{ color: colorForReader(char?.name), fontWeight: 600 }}>{char?.name}</span><span style={{ color: "var(--dim)" }}>→</span><span>{place?.title}</span><button onClick={() => remove(l.id)} style={{ ...miniIconBtn, marginLeft: "auto" }}><X size={11} /></button></div>); })}
          </div>
          <div style={fieldLabel}>Traer a un personaje a un lugar en este capítulo</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select value={addCharId} onChange={(e) => setAddCharId(e.target.value)} style={selectInput}><option value="">Personaje...</option>{characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={addPlaceId} onChange={(e) => setAddPlaceId(e.target.value)} style={selectInput}><option value="">Lugar...</option>{places.map((p) => <option key={p.id} value={p.id}>{p.parentId ? "— " : ""}{p.title}</option>)}</select>
            <button onClick={assign} style={smallOutlineBtn}>+ Ubicar aquí</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button onClick={() => addSublevel(drillId)} style={smallOutlineBtn}>{drillId ? "+ Sub-sitio/sala aquí" : "+ Lugar"}</button>
          </div>
          {places.length === 0 && <div style={{ color: "var(--dim)", fontSize: 11.5, marginTop: 10 }}>Añade lugares en la pestaña Universo (o aquí mismo) para que aparezcan en el mapa.</div>}
        </div>
      </div>
    </div>
  );
}

// ---------------- Universo ----------------
function UniverseTab({ sagaId, universeEntries, setUniverseEntries }) {
  const sagaEntries = universeEntries.filter((u) => u.sagaId === sagaId);
  const places = sagaEntries.filter((e) => e.category === "Lugares");
  function addEntry(category) {
    const title = prompt("Título:"); if (!title) return;
    const base = { id: uid(), sagaId, category, title, content: "", tags: [] };
    if (category === "Lugares") Object.assign(base, { parentId: null, localX: 50, localY: 50, north: 5, south: 5, east: 5, west: 5, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" });
    if (category === "Dioses") Object.assign(base, { domain: "", symbol: "", personality: "", image: null });
    if (category === "Objetos") Object.assign(base, { objectKind: "Normal", image: null });
    setUniverseEntries((u) => [...u, base]);
  }
  function updateEntry(id, patch) { setUniverseEntries((u) => u.map((e) => (e.id === id ? { ...e, ...patch } : e))); }
  function removeEntry(id) { setUniverseEntries((u) => u.filter((e) => e.id !== id)); }
  function addTag(id) { const tag = prompt("Nueva etiqueta:"); if (!tag) return; const e = sagaEntries.find((x) => x.id === id); updateEntry(id, { tags: [...(e.tags || []), tag] }); }
  function removeTag(id, tag) { const e = sagaEntries.find((x) => x.id === id); updateEntry(id, { tags: (e.tags || []).filter((t) => t !== tag) }); }
  function addSublevel(parentId) { const name = prompt("Nombre del sub-sitio/sala:"); if (!name) return; setUniverseEntries((u) => [...u, { id: uid(), sagaId, category: "Lugares", title: name, content: "", tags: [], parentId, localX: 30 + Math.random() * 40, localY: 30 + Math.random() * 40, north: 5, south: 5, east: 5, west: 5, nearRiver: false, nearSea: false, nearMountain: false, nearLake: false, nearVolcano: false, nearCamp: false, isSupernatural: false, isCapital: false, isImportantCourt: false, isIsland: false, kingdomName: "" }]); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {UNIVERSE_CATEGORIES.map((cat) => {
        const entries = cat === "Lugares" ? places.filter((e) => !e.parentId) : sagaEntries.filter((e) => e.category === cat);
        return (
          <div key={cat}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 15 }}>{cat}</div><button onClick={() => addEntry(cat)} style={smallOutlineBtn}>+ Añadir</button></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {entries.map((e) => (
                <PlaceCard key={e.id} entry={e} cat={cat} allPlaces={places} updateEntry={updateEntry} removeEntry={removeEntry} addTag={addTag} removeTag={removeTag} addSublevel={addSublevel} />
              ))}
              {entries.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12, gridColumn: "1/-1" }}>Sin entradas todavía.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function PlaceCard({ entry: e, cat, allPlaces, updateEntry, removeEntry, addTag, removeTag, addSublevel }) {
  const children = allPlaces.filter((p) => p.parentId === e.id);
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
      {(cat === "Dioses" || cat === "Objetos") && <UniverseImage entry={e} onUpdate={(patch) => updateEntry(e.id, patch)} />}
      <div style={{ display: "flex", justifyContent: "space-between" }}><input value={e.title} onChange={(ev) => updateEntry(e.id, { title: ev.target.value })} style={{ ...textInput, fontFamily: "'Fraunces', serif", fontSize: 14, border: "none", padding: 0, background: "none" }} /><button onClick={() => removeEntry(e.id)} style={miniIconBtn}><X size={11} /></button></div>
      <textarea value={e.content} onChange={(ev) => updateEntry(e.id, { content: ev.target.value })} rows={3} style={{ ...textArea, marginTop: 8, fontSize: 12.5 }} placeholder="Detalles..." />
      {cat === "Objetos" && <select value={e.objectKind} onChange={(ev) => updateEntry(e.id, { objectKind: ev.target.value })} style={{ ...selectInput, marginTop: 6, width: "100%" }}>{OBJECT_KINDS.map((k) => <option key={k}>{k}</option>)}</select>}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>{(e.tags || []).map((t) => <span key={t} style={{ fontSize: 9.5, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>{t}<X size={9} style={{ cursor: "pointer" }} onClick={() => removeTag(e.id, t)} /></span>)}<button onClick={() => addTag(e.id)} style={{ fontSize: 9.5, background: "none", border: "1px dashed var(--border)", borderRadius: 8, padding: "2px 6px", color: "var(--dim)", cursor: "pointer" }}>+ etiqueta</button></div>
      {cat === "Lugares" && (
        <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
          {!e.parentId && (<>
            <div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 6 }}>Posición en la historia (1-20 dentro del reino, más = fuera)</div>
            {["north", "south", "east", "west"].map((axis) => (<div key={axis} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontSize: 10, width: 46, color: "var(--dim)" }}>{{ north: "Norte", south: "Sur", east: "Este", west: "Oeste" }[axis]}</span><input type="range" min={0} max={20} value={e[axis] ?? 5} onChange={(ev) => updateEntry(e.id, { [axis]: Number(ev.target.value) })} style={{ flex: 1 }} /><span style={{ fontSize: 10, width: 20, color: "var(--accent)" }}>{e[axis] ?? 5}</span></div>))}
            <input value={e.kingdomName} onChange={(ev) => updateEntry(e.id, { kingdomName: ev.target.value })} placeholder="Si está fuera: ¿otro reino? ¿cuál?" style={{ ...textInput, marginTop: 4, marginBottom: 6, fontSize: 11, ...(e.kingdomName ? { borderColor: "#C1594A" } : {}) }} />
          </>)}
          {e.parentId && (<div style={{ marginBottom: 6 }}><div style={{ fontSize: 10.5, color: "var(--dim)", marginBottom: 4 }}>Posición dentro de "{allPlaces.find((p) => p.id === e.parentId)?.title}"</div>{["localX", "localY"].map((axis) => (<div key={axis} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontSize: 10, width: 20, color: "var(--dim)" }}>{axis === "localX" ? "X" : "Y"}</span><input type="range" min={0} max={100} value={e[axis] ?? 50} onChange={(ev) => updateEntry(e.id, { [axis]: Number(ev.target.value) })} style={{ flex: 1 }} /></div>))}</div>)}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{[["nearRiver","Río"],["nearSea","Mar"],["nearMountain","Montaña"],["nearLake","Lago"],["nearVolcano","Volcán"],["nearCamp","Campamento militar"],["isIsland","Isla"],["isSupernatural","Sobrenatural"],["isCapital","Capital"],["isImportantCourt","Corte importante"]].map(([key,label]) => (<label key={key} style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}><input type="checkbox" checked={!!e[key]} onChange={(ev) => updateEntry(e.id, { [key]: ev.target.checked })} /> {label}</label>))}</div>
          <button onClick={() => addSublevel(e.id)} style={{ ...smallOutlineBtn, marginTop: 8, fontSize: 10.5 }}><DoorOpen size={11} /> + Sub-sitio / sala aquí</button>
          {children.length > 0 && <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, borderLeft: "2px solid var(--border)", paddingLeft: 8 }}>{children.map((ch) => <PlaceCard key={ch.id} entry={ch} cat={cat} allPlaces={allPlaces} updateEntry={updateEntry} removeEntry={removeEntry} addTag={addTag} removeTag={removeTag} addSublevel={addSublevel} />)}</div>}
        </div>
      )}
      {cat === "Dioses" && (<div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}><input value={e.domain} onChange={(ev) => updateEntry(e.id, { domain: ev.target.value })} placeholder="Ámbito / dominio (ej. guerra, amor...)" style={{ ...textInput, fontSize: 11 }} /><input value={e.symbol} onChange={(ev) => updateEntry(e.id, { symbol: ev.target.value })} placeholder="Símbolo" style={{ ...textInput, fontSize: 11 }} /><input value={e.personality} onChange={(ev) => updateEntry(e.id, { personality: ev.target.value })} placeholder="Personalidad" style={{ ...textInput, fontSize: 11 }} /></div>)}
    </div>
  );
}
function UniverseImage({ entry, onUpdate }) { const ref = useRef(null); return (<div onClick={() => ref.current.click()} style={{ width: "100%", height: 90, borderRadius: 6, marginBottom: 8, background: entry.image ? `url(${entry.image}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{!entry.image && <ImageIcon size={18} color="var(--dim)" />}<input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ image: url }))} /></div>); }

// ---------------- Lore & Bestiario ----------------
function LoreTab({ sagaId, loreEntries, setLoreEntries, bestiary, setBestiary }) {
  const entries = loreEntries.filter((l) => l.sagaId === sagaId); const creatures = bestiary.filter((b) => b.sagaId === sagaId);
  function addLore() { const title = prompt("Nombre del elemento:"); if (!title) return; const kind = prompt(`Tipo (${LORE_TYPES.join(", ")}):`, LORE_TYPES[0]) || LORE_TYPES[0]; setLoreEntries((l) => [...l, { id: uid(), sagaId, title, kind: LORE_TYPES.includes(kind) ? kind : LORE_TYPES[0], description: "", fn: "", inventor: "", materials: "", era: "" }]); }
  function updateLore(id, patch) { setLoreEntries((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e))); }
  function removeLore(id) { setLoreEntries((l) => l.filter((e) => e.id !== id)); }
  function addCreature() { const name = prompt("Nombre de la criatura:"); if (!name) return; setBestiary((b) => [...b, { id: uid(), sagaId, name, species: "", danger: "Bajo", image: null, description: "" }]); }
  function updateCreature(id, patch) { setBestiary((b) => b.map((e) => (e.id === id ? { ...e, ...patch } : e))); }
  function removeCreature(id) { setBestiary((b) => b.filter((e) => e.id !== id)); }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}><ScrollText size={16} color="var(--accent)" /> Elementos de lore</div><button onClick={addLore} style={smallOutlineBtn}>+ Añadir elemento</button></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>{entries.map((e) => (<div key={e.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}><div style={{ display: "flex", justifyContent: "space-between" }}><input value={e.title} onChange={(ev) => updateLore(e.id, { title: ev.target.value })} style={{ ...textInput, fontFamily: "'Fraunces', serif", fontSize: 14, border: "none", padding: 0, background: "none" }} /><button onClick={() => removeLore(e.id)} style={miniIconBtn}><X size={11} /></button></div><select value={e.kind} onChange={(ev) => updateLore(e.id, { kind: ev.target.value })} style={{ ...selectInput, marginTop: 6, width: "100%" }}>{LORE_TYPES.map((t) => <option key={t}>{t}</option>)}</select><textarea value={e.description} onChange={(ev) => updateLore(e.id, { description: ev.target.value })} rows={2} placeholder="Descripción del elemento en el mundo..." style={{ ...textArea, marginTop: 8, fontSize: 12 }} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}><input value={e.fn} onChange={(ev) => updateLore(e.id, { fn: ev.target.value })} placeholder="Función" style={{ ...textInput, fontSize: 11 }} /><input value={e.inventor} onChange={(ev) => updateLore(e.id, { inventor: ev.target.value })} placeholder="Inventor/origen" style={{ ...textInput, fontSize: 11 }} /><input value={e.materials} onChange={(ev) => updateLore(e.id, { materials: ev.target.value })} placeholder="Materiales" style={{ ...textInput, fontSize: 11 }} /><input value={e.era} onChange={(ev) => updateLore(e.id, { era: ev.target.value })} placeholder="Era / época" style={{ ...textInput, fontSize: 11 }} /></div></div>))}{entries.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin elementos de lore todavía.</div>}</div>
      </div>
      <div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}><PawPrint size={16} color="var(--accent)" /> Bestiario</div><button onClick={addCreature} style={smallOutlineBtn}>+ Añadir criatura</button></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>{creatures.map((c) => (<div key={c.id} style={{ background: "var(--bg2)", border: `1px solid ${BESTIARY_DANGER_COLOR[c.danger]}55`, borderTop: `3px solid ${BESTIARY_DANGER_COLOR[c.danger]}`, borderRadius: 8, padding: 12 }}><div style={{ display: "flex", gap: 10 }}><BestiaryImage creature={c} onUpdate={(patch) => updateCreature(c.id, patch)} /><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between" }}><input value={c.name} onChange={(ev) => updateCreature(c.id, { name: ev.target.value })} style={{ ...textInput, fontFamily: "'Fraunces', serif", fontSize: 13, border: "none", padding: 0, background: "none" }} /><button onClick={() => removeCreature(c.id)} style={miniIconBtn}><X size={11} /></button></div><input value={c.species} onChange={(ev) => updateCreature(c.id, { species: ev.target.value })} placeholder="Tipo / especie (dragón, demonio, hada...)" style={{ ...textInput, fontSize: 11, marginTop: 6 }} /><select value={c.danger} onChange={(ev) => updateCreature(c.id, { danger: ev.target.value })} style={{ ...selectInput, marginTop: 6, color: BESTIARY_DANGER_COLOR[c.danger] }}>{BESTIARY_DANGER.map((d) => <option key={d}>{d}</option>)}</select></div></div><textarea value={c.description} onChange={(ev) => updateCreature(c.id, { description: ev.target.value })} rows={2} placeholder="Habilidades, comportamiento..." style={{ ...textArea, marginTop: 8, fontSize: 12 }} /></div>))}{creatures.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Sin criaturas todavía.</div>}</div>
      </div>
    </div>
  );
}
function BestiaryImage({ creature, onUpdate }) { const ref = useRef(null); return (<div onClick={() => ref.current.click()} style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: creature.image ? `url(${creature.image}) center/cover` : "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{!creature.image && <ImageIcon size={14} color="var(--dim)" />}<input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && fileToDataUrl(e.target.files[0], (url) => onUpdate({ image: url }))} /></div>); }

// ---------------- Pizarra ----------------
function CorkboardTab({ bookId, corkNotes, setCorkNotes }) {
  const notes = corkNotes[bookId] || [];
  const dragRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const maxZ = useRef(notes.reduce((m, n) => Math.max(m, n.z || 1), 1));
  function addNote() { const color = CORK_COLORS[hash(uid()) % CORK_COLORS.length]; maxZ.current += 1; setCorkNotes((c) => ({ ...c, [bookId]: [...(c[bookId] || []), { id: uid(), text: "", color, x: 20 + ((c[bookId]?.length || 0) * 24) % 300, y: 20 + ((c[bookId]?.length || 0) * 18) % 200, shape: "rect", size: "M", z: maxZ.current }] })); }
  function updateNote(id, patch) { setCorkNotes((c) => ({ ...c, [bookId]: (c[bookId] || []).map((n) => (n.id === id ? { ...n, ...patch } : n)) })); }
  function removeNote(id) { setCorkNotes((c) => ({ ...c, [bookId]: (c[bookId] || []).filter((n) => n.id !== id) })); }
  function bringToFront(id) { maxZ.current += 1; updateNote(id, { z: maxZ.current }); }
  function onPointerDown(e, id) { bringToFront(id); const note = notes.find((n) => n.id === id); dragRef.current = { id, startX: e.clientX, startY: e.clientY, origX: note.x, origY: note.y }; window.addEventListener("pointermove", onPointerMove); window.addEventListener("pointerup", onPointerUp); }
  function onPointerMove(e) { if (!dragRef.current) return; const { id, startX, startY, origX, origY } = dragRef.current; updateNote(id, { x: Math.max(0, origX + (e.clientX - startX) / zoom), y: Math.max(0, origY + (e.clientY - startY) / zoom) }); }
  function onPointerUp() { dragRef.current = null; window.removeEventListener("pointermove", onPointerMove); window.removeEventListener("pointerup", onPointerUp); }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div style={fieldLabel}>Pizarra de notas — arrastra los post-it por el corcho</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} style={iconBtn}><ZoomOut size={13} /></button><button onClick={() => setZoom((z) => Math.min(2, z + 0.2))} style={iconBtn}><ZoomIn size={13} /></button><button onClick={addNote} style={primaryBtn}><PlusSquare size={13} /> Nueva nota</button></div></div>
      <div style={{ overflow: "auto", maxHeight: 560, border: "1px solid var(--border)", borderRadius: 10 }}>
        <div style={{ position: "relative", minHeight: 420, width: `${100 / zoom}%`, transform: `scale(${zoom})`, transformOrigin: "top left", background: "repeating-linear-gradient(45deg, var(--bg3), var(--bg3) 10px, var(--bg2) 10px, var(--bg2) 20px)" }}>
          {notes.map((n) => {
            const sz = CORK_SIZES[n.size] || CORK_SIZES.M;
            return (
              <div key={n.id} onPointerDown={(e) => onPointerDown(e, n.id)} style={{ position: "absolute", left: n.x, top: n.y, width: sz, minHeight: n.shape === "circle" ? sz : sz * 0.75, background: n.color, borderRadius: n.shape === "circle" ? "50%" : n.shape === "cloud" ? "40% 60% 55% 45% / 55% 45% 60% 40%" : 4, padding: n.shape === "circle" ? sz * 0.18 : 10, boxShadow: "2px 3px 8px rgba(0,0,0,0.3)", cursor: "grab", transform: `rotate(${(hash(n.id) % 7) - 3}deg)`, zIndex: n.z || 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}><button onClick={() => removeNote(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2B2A25" }}><X size={12} /></button></div>
                <textarea value={n.text} onChange={(e) => updateNote(n.id, { text: e.target.value })} onPointerDown={(e) => e.stopPropagation()} rows={4} placeholder="Escribe aquí..." style={{ width: "100%", flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: "#2B2A25", fontSize: 12, fontFamily: "'Inter', sans-serif", textAlign: n.shape === "circle" ? "center" : "left" }} />
                <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>{CORK_COLORS.map((c) => <button key={c} onPointerDown={(e) => e.stopPropagation()} onClick={() => updateNote(n.id, { color: c })} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: n.color === c ? "1.5px solid #2B2A25" : "1px solid rgba(0,0,0,0.2)", cursor: "pointer" }} />)}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 3 }}>{CORK_SHAPES.map((s) => <button key={s} onPointerDown={(e) => e.stopPropagation()} onClick={() => updateNote(n.id, { shape: s })} style={{ fontSize: 8.5, padding: "1px 4px", borderRadius: 3, border: n.shape === s ? "1px solid #2B2A25" : "1px solid rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{s === "rect" ? "▭" : s === "circle" ? "●" : "☁"}</button>)}{Object.keys(CORK_SIZES).map((s) => <button key={s} onPointerDown={(e) => e.stopPropagation()} onClick={() => updateNote(n.id, { size: s })} style={{ fontSize: 8.5, padding: "1px 4px", borderRadius: 3, border: n.size === s ? "1px solid #2B2A25" : "1px solid rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{s}</button>)}</div>
              </div>
            );
          })}
          {notes.length === 0 && <div style={{ color: "var(--dim)", fontSize: 12.5, padding: 20 }}>Añade tu primera nota.</div>}
        </div>
      </div>
    </div>
  );
}

// ---------------- Exportar ----------------
function ExportTab({ book, chapters, characters, universeEntries, bookActs }) {
  const [selected, setSelected] = useState(chapters.map((c) => c.id)); const [format, setFormat] = useState("word"); const [done, setDone] = useState(""); const [doneWorld, setDoneWorld] = useState("");
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 8 }}>Exportar "{book?.title}"</div>
      <div style={fieldLabel}>Capítulos a exportar</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>{chapters.map((c) => <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /> {c.title}</label>)}</div>
      <div style={fieldLabel}>Formato</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}><button onClick={() => setFormat("word")} style={{ ...toggleBtn, ...(format === "word" ? toggleBtnActive : {}) }}>Word (.docx)</button><button onClick={() => setFormat("pdf")} style={{ ...toggleBtn, ...(format === "pdf" ? toggleBtnActive : {}) }}>PDF</button></div>
      <button onClick={() => setDone(`${selected.length} capítulo(s) exportados a ${format === "word" ? "Word" : "PDF"}.`)} style={primaryBtn}><Download size={13} /> Exportar selección</button>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}><div style={fieldLabel}>Libro completo</div><button onClick={() => setDone(`Libro completo exportado a EPUB.`)} style={smallOutlineBtn}><Download size={12} /> Exportar todo a EPUB</button></div>
      {done && <div style={{ marginTop: 14, fontSize: 12.5, color: "#5FA98C" }}>{done} — simulado en este prototipo, en la app real descargaría el archivo.</div>}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}><div style={fieldLabel}>Construcción de mundo (worldbuilding)</div><div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 8 }}>Recopila personajes ({characters.length}), estructura/actos ({bookActs.length}) y entradas de universo ({universeEntries.length}) en un solo documento de referencia.</div><button onClick={() => setDoneWorld(`Documento de construcción de mundo exportado (${characters.length} personajes, ${bookActs.length} actos, ${universeEntries.length} entradas de universo).`)} style={smallOutlineBtn}><Download size={12} /> Exportar bloque narrativo completo</button>{doneWorld && <div style={{ marginTop: 10, fontSize: 12.5, color: "#5FA98C" }}>{doneWorld} — simulado en este prototipo.</div>}</div>
    </div>
  );
}

// ---------------- Beta lectores ----------------
const BETA_DISCLAIMER = "Este enlace es de un solo uso, una vez se cierre no se podrá volver a abrir y tus comentarios serán enviados. Solo puedes leer y comentar: no se puede editar, copiar ni seleccionar el contenido para evitar plagios. Espero que disfrutes la lectura ¡comenta todo lo que quieras! <3";

function BetaReaderTab({ bookId, chapters, setChapters, surveys, setSurveys }) {
  const [linkChapter, setLinkChapter] = useState(chapters[0]?.id || "");
  const [generatedLink, setGeneratedLink] = useState(null);
  const [simComment, setSimComment] = useState(""); const [simExcerpt, setSimExcerpt] = useState("");
  const [readerProfile, setReaderProfile] = useState(null);
  const [showRegister, setShowRegister] = useState(false); const [showDisclaimer, setShowDisclaimer] = useState(false); const [showSurvey, setShowSurvey] = useState(false);
  const [regDraft, setRegDraft] = useState({ name: "", email: "", color: READER_COLORS[0] });
  const [surveyDraft, setSurveyDraft] = useState({ importance: 0, impact: 0, opinion: "" });
  function generate() { setGeneratedLink(`https://atelier.app/leer/${uid()}`); }
  function openReaderLink() { setShowDisclaimer(true); }
  function beginReading() { setShowDisclaimer(false); if (!readerProfile) setShowRegister(true); }
  function completeRegister() { if (!regDraft.name || !regDraft.email) return; setReaderProfile(regDraft); setShowRegister(false); }
  function addSimComment() { if (!simComment || !simExcerpt.trim() || !readerProfile) return; setChapters((cs) => cs.map((c) => c.id === linkChapter ? { ...c, betaComments: [...(c.betaComments || []), { id: uid(), reader: readerProfile.name, comment: simComment, excerpt: simExcerpt, notified: false }] } : c)); setSimComment(""); setSimExcerpt(""); }
  function submitSurvey() { setSurveys((s) => [...s, { id: uid(), chapterId: linkChapter, reader: readerProfile?.name || "Anónimo", ...surveyDraft }]); setSurveyDraft({ importance: 0, impact: 0, opinion: "" }); setShowSurvey(false); }
  const activeChapter = chapters.find((c) => c.id === linkChapter);
  const chapterSurveys = surveys.filter((s) => s.chapterId === linkChapter);

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 8 }}>Enviar capítulo a un beta lector</div>
      <div style={{ color: "var(--text)", fontSize: 13.5, marginBottom: 16 }}>Genera un enlace de un solo uso. El lector se registra con su correo, elige un color para sus comentarios la primera vez, y solo puede leer y comentar — no puede editar ni copiar el texto. Cada comentario debe indicar el fragmento exacto al que se refiere. Al final puede rellenar, si quiere, un cuestionario opcional.</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}><select value={linkChapter} onChange={(e) => setLinkChapter(e.target.value)} style={selectInput}>{chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select><button onClick={generate} style={primaryBtn}>Generar enlace</button></div>
      {generatedLink && (<div style={{ marginBottom: 16 }}><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{generatedLink} <span style={{ color: "var(--dim)" }}>(un solo uso — simulado)</span></div><button onClick={openReaderLink} style={{ ...smallOutlineBtn, marginTop: 8 }}><Mail size={12} /> Simular apertura del enlace (vista del lector)</button></div>)}
      <div style={fieldLabel}>Comentarios recibidos en "{activeChapter?.title}"</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 0 14px" }}>{(activeChapter?.betaComments || []).map((c) => <div key={c.id} style={{ background: "var(--bg2)", border: `1px solid ${colorForReader(c.reader)}55`, borderLeft: `3px solid ${colorForReader(c.reader)}`, borderRadius: 8, padding: 10, fontSize: 12.5 }}><span style={{ color: colorForReader(c.reader), fontWeight: 600 }}>{c.reader} ha comentado:</span>{c.excerpt && <div style={{ color: "var(--dim)", fontStyle: "italic", margin: "3px 0" }}>"{c.excerpt}"</div>} <span style={{ color: "var(--text)" }}>{c.comment}</span></div>)}{(activeChapter?.betaComments || []).length === 0 && <div style={{ color: "var(--dim)", fontSize: 12 }}>Aún no hay comentarios.</div>}</div>
      {chapterSurveys.length > 0 && (<><div style={fieldLabel}>Cuestionarios recibidos</div><div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "8px 0 14px" }}>{chapterSurveys.map((s) => <div key={s.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, fontSize: 12 }}><b>{s.reader}</b> — Importancia: {s.importance || "-"}/5 · Impacto: {s.impact || "-"}/5{s.opinion && <div style={{ color: "var(--dim)", marginTop: 4 }}>{s.opinion}</div>}</div>)}</div></>)}
      {readerProfile && (<div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}><span style={{ fontSize: 11, color: "var(--dim)" }}>Comentando como <span style={{ color: readerProfile.color, fontWeight: 600 }}>{readerProfile.name}</span>:</span><input value={simExcerpt} onChange={(e) => setSimExcerpt(e.target.value)} placeholder="Fragmento exacto al que te refieres (obligatorio)" style={{ ...textInput, width: 220 }} /><input value={simComment} onChange={(e) => setSimComment(e.target.value)} placeholder="Comentario..." style={{ ...textInput, flex: 1, minWidth: 140 }} /><button onClick={addSimComment} style={smallOutlineBtn}>Enviar</button><button onClick={() => setShowSurvey(true)} style={smallOutlineBtn}>Rellenar cuestionario (opcional)</button></div>)}
      {showDisclaimer && (<Modal onClose={() => setShowDisclaimer(false)}><div style={{ width: 340, textAlign: "center" }}><Ban size={26} color="var(--accent)" style={{ marginBottom: 10 }} /><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10 }}>Antes de empezar a leer</div><div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 18 }}>{BETA_DISCLAIMER}</div><button onClick={beginReading} style={primaryBtn}>Entendido, empezar a leer</button></div></Modal>)}
      {showRegister && (<Modal onClose={() => setShowRegister(false)}><div style={{ width: 320 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 10 }}>Regístrate para comentar</div><Field label="Tu nombre" value={regDraft.name} onChange={(v) => setRegDraft((d) => ({ ...d, name: v }))} /><Field label="Correo electrónico" value={regDraft.email} onChange={(v) => setRegDraft((d) => ({ ...d, email: v }))} /><div style={fieldLabel}>Color para tus comentarios</div><div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>{READER_COLORS.map((c) => <button key={c} onClick={() => setRegDraft((d) => ({ ...d, color: c }))} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: regDraft.color === c ? "2px solid var(--text)" : "1px solid var(--border)", cursor: "pointer" }} />)}</div><button onClick={completeRegister} style={primaryBtn}>Empezar a leer y comentar</button></div></Modal>)}
      {showSurvey && (<Modal onClose={() => setShowSurvey(false)}><div style={{ width: 340 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 6 }}>Cuestionario del capítulo</div><div style={{ fontSize: 11.5, color: "var(--dim)", marginBottom: 14 }}>Totalmente opcional — solo si te apetece.</div><div style={{ marginBottom: 12 }}><div style={fieldLabel}>¿Cuánto importa este capítulo en la historia? (1-5)</div><div style={{ display: "flex", gap: 6 }}>{[1,2,3,4,5].map((n) => <button key={n} onClick={() => setSurveyDraft((d) => ({ ...d, importance: n }))} style={{ ...toggleBtn, ...(surveyDraft.importance === n ? toggleBtnActive : {}) }}>{n}</button>)}</div></div><div style={{ marginBottom: 12 }}><div style={fieldLabel}>Nivel de impacto (1-5)</div><div style={{ display: "flex", gap: 6 }}>{[1,2,3,4,5].map((n) => <button key={n} onClick={() => setSurveyDraft((d) => ({ ...d, impact: n }))} style={{ ...toggleBtn, ...(surveyDraft.impact === n ? toggleBtnActive : {}) }}>{n}</button>)}</div></div><textarea value={surveyDraft.opinion} onChange={(e) => setSurveyDraft((d) => ({ ...d, opinion: e.target.value }))} rows={3} placeholder="Desarrolla tu opinión (opcional)" style={textArea} /><div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}><button onClick={() => setShowSurvey(false)} style={smallOutlineBtn}>Omitir</button><button onClick={submitSurvey} style={primaryBtn}>Enviar</button></div></div></Modal>)}
      {readerProfile && activeChapter && (<div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}><div style={fieldLabel}>Vista previa del lector (puedes seleccionar texto para comentar, pero no copiarlo)</div><div onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()} dangerouslySetInnerHTML={{ __html: activeChapter.content }} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, fontFamily: `'${activeChapter.font}', serif`, fontSize: 14.5, lineHeight: 1.7, marginTop: 8 }} /></div>)}
    </div>
  );
}

// ---------------- shared styles ----------------
const primaryBtn = { display: "flex", alignItems: "center", gap: 6, background: "var(--accent)", color: "var(--accentText)", border: "none", borderRadius: 7, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" };
const smallOutlineBtn = { display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" };
const iconBtn = { background: "none", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const miniIconBtn = { background: "none", border: "none", color: "var(--dim)", cursor: "pointer", display: "flex", alignItems: "center" };
const toggleBtn = { display: "flex", alignItems: "center", gap: 5, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" };
const toggleBtnActive = { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--accentText)" };
const titleInput = { background: "none", border: "none", outline: "none", color: "var(--text)", fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, width: "100%" };
const textInput = { width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", color: "var(--text)", fontSize: 13, outline: "none" };
const textArea = { width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", color: "var(--text)", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "'Inter', sans-serif" };
const selectInput = { background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", color: "var(--text)", fontSize: 12.5, outline: "none" };
const fieldLabel = { fontSize: 11.5, color: "var(--dim)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 };
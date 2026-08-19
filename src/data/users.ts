export interface User {
  name: string;
  role: "Professora" | "Professor" | "Ubongo" | "Aluno" | "Aluna";
  login: string;
  password?: string;
}

export const users: User[] = [
  { name: "Niltes", role: "Professora", login: "niltes", password: "Nilt26" },
  { name: "Diego", role: "Professor", login: "diego", password: "Diego47" },
  { name: "Prietto", role: "Ubongo", login: "prietto", password: "Prie52" },
  { name: "Matheus", role: "Ubongo", login: "matheus", password: "Math67" },
  { name: "Dandara", role: "Ubongo", login: "dandara", password: "Danda64" },
  { name: "Adrianno", role: "Aluno", login: "adrianno", password: "Adri27" },
  { name: "Angelina", role: "Aluna", login: "angelina", password: "Ange43" },
  { name: "Arthur", role: "Aluno", login: "arthur", password: "Artu58" },
  { name: "Beatriz", role: "Aluna", login: "beatriz", password: "Beat31" },
  { name: "Bianca", role: "Aluna", login: "bianca", password: "Bian72" },
  { name: "Bruno", role: "Aluno", login: "bruno", password: "Brun46" },
  { name: "Enzo", role: "Aluno", login: "enzo", password: "Enzo29" },
  { name: "Felippe", role: "Aluno", login: "felippe", password: "Feli63" },
  { name: "Marcella", role: "Aluna", login: "marcella", password: "Marc37" },
  { name: "Maria", role: "Aluna", login: "maria", password: "Mari54" },
  { name: "Maryana", role: "Aluna", login: "maryana", password: "Mary28" },
  { name: "Maryna", role: "Aluna", login: "maryna", password: "Myna61" },
  { name: "Pietro", role: "Aluno", login: "pietro", password: "Piet35" },
  { name: "Sarah", role: "Aluna", login: "sarah", password: "Sara74" },
  { name: "Thales", role: "Aluno", login: "thales", password: "Thal42" },
  { name: "Vitoria", role: "Aluna", login: "vitoria", password: "Vito57" },
  { name: "Luiza", role: "Aluna", login: "luiza", password: "Luiz36" }
];

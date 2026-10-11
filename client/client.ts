import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(
    fs.readFileSync("target/idl/counter_app.json", "utf8")
  );
  const program: any = new Program(idl, provider);

  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    program.programId
  );
  console.log("Program Id:", program.programId.toBase58());
  console.log("Counter PDA:", counterPda.toBase58());

  const existing = await program.account.counter.fetchNullable(counterPda);
  if (!existing) {
    const tx = await program.methods.initialize().rpc();
    console.log("initialize tx:", tx);
  } else {
    console.log("Счётчик уже создан");
  }

  const tx2 = await program.methods.increment().rpc();
  console.log("increment tx:", tx2);

  const counter = await program.account.counter.fetch(counterPda);
  console.log("count =", counter.count.toString());
  console.log("authority =", counter.authority.toBase58());
}

main().catch(console.error);
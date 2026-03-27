import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { masteres } from "@/data/masteres";

type Body = {
  name: string;
  email: string;
  masterSlug: string;
  message: string;
};

function escape(value: string | undefined) {
  return (value ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Body>;

    const name = escape(body.name);
    const email = escape(body.email);
    const masterSlug = escape(body.masterSlug);
    const message = escape(body.message);

    if (!name || !email || !message || !masterSlug) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    // Resolve master title from slug
    const masterTitle =
      masterSlug === "other"
        ? "Other / Not sure yet"
        : masteres.find((m) => m.slug === masterSlug)?.title ?? masterSlug;

    // Gmail SMTP (requires App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // youssefelmoutee@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // app password
      },
    });

    const to = "youssefelmoutee@gmail.com";

    const subject = `ESIA Contact — ${masterTitle} — ${name}`;
    const text = [
      `New contact request from ESIA website`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `Selected Master: ${masterTitle} (${masterSlug})`,
      ``,
      `Message:`,
      message,
    ].join("\n");

    await transporter.sendMail({
      from: `"ESIA Website" <${process.env.GMAIL_USER}>`,
      to,
      replyTo: email,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

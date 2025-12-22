import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import styles from './layout.module.css';
import ReduxProvider from "@/store/ReduxProvider";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import Bar from "@/components/Bar/Bar";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Skypro Music",
  description: "Музыкальное приложение",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <ReduxProvider>
          <div className={styles.rootWrapper}>
            <div className={styles.mainContainer}>
              {children}
              <AudioPlayer />
            </div>
            <Bar />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
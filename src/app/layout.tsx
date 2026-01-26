import type { Metadata } from "next";
import "./globals.css";
import styles from './layout.module.css';
import ReduxProvider from "@/store/ReduxProvider";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

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
      <body>
        <ReduxProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className={styles.rootWrapper}>
                <div className={styles.mainContainer}>
                  {children}
                  <AudioPlayer />
                </div>
              </div>
            </NotificationProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
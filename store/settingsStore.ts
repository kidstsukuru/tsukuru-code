import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontSize = 'small' | 'medium' | 'large';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'ja' | 'en';

interface SettingsState {
    // 表示・UI設定
    theme: Theme;
    fontSize: FontSize;
    language: Language;
    animationsEnabled: boolean;

    // 学習設定
    soundEnabled: boolean;
    dailyGoalMinutes: number;

    // 通知設定
    pushNotificationsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    learningReminderEnabled: boolean;
    reminderTime: string; // HH:mm形式

    // アクション
    setTheme: (theme: Theme) => void;
    setFontSize: (size: FontSize) => void;
    setAnimationsEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setDailyGoalMinutes: (minutes: number) => void;
    setPushNotificationsEnabled: (enabled: boolean) => void;
    setEmailNotificationsEnabled: (enabled: boolean) => void;
    setLearningReminderEnabled: (enabled: boolean) => void;
    setReminderTime: (time: string) => void;
    setLanguage: (language: Language) => void;
    resetSettings: () => void;
}

const defaultSettings = {
    theme: 'light' as Theme,
    fontSize: 'medium' as FontSize,
    language: 'ja' as Language,
    animationsEnabled: true,
    soundEnabled: true,
    dailyGoalMinutes: 30,
    pushNotificationsEnabled: false,
    emailNotificationsEnabled: true,
    learningReminderEnabled: false,
    reminderTime: '18:00',
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            setTheme: (theme) => set({ theme }),
            setFontSize: (fontSize) => set({ fontSize }),
            setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
            setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
            setDailyGoalMinutes: (dailyGoalMinutes) => set({ dailyGoalMinutes }),
            setPushNotificationsEnabled: (pushNotificationsEnabled) => set({ pushNotificationsEnabled }),
            setEmailNotificationsEnabled: (emailNotificationsEnabled) => set({ emailNotificationsEnabled }),
            setLearningReminderEnabled: (learningReminderEnabled) => set({ learningReminderEnabled }),
            setReminderTime: (reminderTime) => set({ reminderTime }),
            setLanguage: (language: Language) => set({ language }),
            resetSettings: () => set(defaultSettings),
        }),
        {
            name: 'tsukuru-settings',
        }
    )
);

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  time: string;
  status: MessageStatus;
  isOwn: boolean;
  replyTo?: string;
  type?: "text" | "sticker" | "system";
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  color: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
  members?: number;
  pinned?: boolean;
  muted?: boolean;
}

export const CURRENT_USER = {
  id: "me",
  name: "Вы",
  avatar: "Я",
  color: "#5288c1",
};

export const chatsData: Chat[] = [
  {
    id: "1",
    name: "Алиса Петрова",
    avatar: "АП",
    color: "#e17076",
    lastMessage: "Окей, договорились! 👍",
    lastTime: "14:32",
    unread: 0,
    online: true,
    pinned: true,
  },
  {
    id: "2",
    name: "Команда Проекта",
    avatar: "КП",
    color: "#6fb9f0",
    lastMessage: "Максим: Деплой прошёл успешно 🚀",
    lastTime: "13:15",
    unread: 5,
    online: false,
    isGroup: true,
    members: 8,
    pinned: true,
  },
  {
    id: "3",
    name: "Дмитрий Соколов",
    avatar: "ДС",
    color: "#a695e7",
    lastMessage: "Посмотрю и отвечу попозже",
    lastTime: "12:48",
    unread: 1,
    online: false,
  },
  {
    id: "4",
    name: "Маркетинг & PR",
    avatar: "МП",
    color: "#f6c44f",
    lastMessage: "Не забудьте про митинг в 15:00",
    lastTime: "11:00",
    unread: 0,
    online: false,
    isGroup: true,
    members: 23,
    muted: true,
  },
  {
    id: "5",
    name: "Мария Иванова",
    avatar: "МИ",
    color: "#5ca9e8",
    lastMessage: "Спасибо большое! ❤️",
    lastTime: "вчера",
    unread: 0,
    online: true,
  },
  {
    id: "6",
    name: "Сергей Николаев",
    avatar: "СН",
    color: "#ee7aae",
    lastMessage: "Ладно, понял тебя",
    lastTime: "вчера",
    unread: 0,
    online: false,
  },
  {
    id: "7",
    name: "Анна Смирнова",
    avatar: "АС",
    color: "#4daf4e",
    lastMessage: "Пришли ссылку, пожалуйста",
    lastTime: "пн",
    unread: 0,
    online: false,
  },
  {
    id: "8",
    name: "Design Team",
    avatar: "DT",
    color: "#ff7043",
    lastMessage: "Никита: Готово, смотрите файл",
    lastTime: "пн",
    unread: 0,
    online: false,
    isGroup: true,
    members: 5,
  },
];

export const messagesData: Record<string, Message[]> = {
  "1": [
    {
      id: "1-1",
      chatId: "1",
      senderId: "1",
      text: "Привет! Как дела с проектом?",
      time: "14:10",
      status: "read",
      isOwn: false,
    },
    {
      id: "1-2",
      chatId: "1",
      senderId: "me",
      text: "Всё идёт по плану! Почти закончили первый модуль 🎉",
      time: "14:12",
      status: "read",
      isOwn: true,
    },
    {
      id: "1-3",
      chatId: "1",
      senderId: "1",
      text: "Отлично! Когда сможешь показать демо?",
      time: "14:15",
      status: "read",
      isOwn: false,
    },
    {
      id: "1-4",
      chatId: "1",
      senderId: "me",
      text: "Завтра в 12:00, если тебе удобно",
      time: "14:20",
      status: "read",
      isOwn: true,
    },
    {
      id: "1-5",
      chatId: "1",
      senderId: "1",
      text: "Окей, договорились! 👍",
      time: "14:32",
      status: "read",
      isOwn: false,
    },
  ],
  "2": [
    {
      id: "2-1",
      chatId: "2",
      senderId: "system",
      text: "Алиса создала группу «Команда Проекта»",
      time: "10:00",
      status: "read",
      isOwn: false,
      type: "system",
    },
    {
      id: "2-2",
      chatId: "2",
      senderId: "other1",
      text: "Всем привет! Рад быть в команде 👋",
      time: "10:05",
      status: "read",
      isOwn: false,
    },
    {
      id: "2-3",
      chatId: "2",
      senderId: "me",
      text: "Привет всем! Давайте обсудим задачи на неделю",
      time: "10:10",
      status: "read",
      isOwn: true,
    },
    {
      id: "2-4",
      chatId: "2",
      senderId: "other2",
      text: "Я занимаюсь бэкендом, жди пулл-реквест к обеду",
      time: "11:30",
      status: "read",
      isOwn: false,
    },
    {
      id: "2-5",
      chatId: "2",
      senderId: "me",
      text: "Супер, спасибо! Я в это время займусь тестами",
      time: "11:45",
      status: "read",
      isOwn: true,
    },
    {
      id: "2-6",
      chatId: "2",
      senderId: "other3",
      text: "Деплой прошёл успешно 🚀",
      time: "13:15",
      status: "read",
      isOwn: false,
    },
  ],
  "3": [
    {
      id: "3-1",
      chatId: "3",
      senderId: "me",
      text: "Дмитрий, можешь посмотреть мой PR? Там небольшие изменения",
      time: "12:00",
      status: "read",
      isOwn: true,
    },
    {
      id: "3-2",
      chatId: "3",
      senderId: "3",
      text: "Посмотрю и отвечу попозже",
      time: "12:48",
      status: "read",
      isOwn: false,
    },
  ],
  "4": [
    {
      id: "4-1",
      chatId: "4",
      senderId: "other1",
      text: "Коллеги, не забудьте про митинг в 15:00! Повестка: квартальный отчёт",
      time: "11:00",
      status: "read",
      isOwn: false,
    },
    {
      id: "4-2",
      chatId: "4",
      senderId: "me",
      text: "Буду!",
      time: "11:05",
      status: "read",
      isOwn: true,
    },
  ],
  "5": [
    {
      id: "5-1",
      chatId: "5",
      senderId: "me",
      text: "Мария, передала посылку Сергею как ты просила",
      time: "вчера 16:20",
      status: "read",
      isOwn: true,
    },
    {
      id: "5-2",
      chatId: "5",
      senderId: "5",
      text: "Спасибо большое! ❤️",
      time: "вчера 16:45",
      status: "read",
      isOwn: false,
    },
  ],
  "6": [
    {
      id: "6-1",
      chatId: "6",
      senderId: "me",
      text: "Сергей, я перенёс встречу на пятницу",
      time: "вчера 14:00",
      status: "read",
      isOwn: true,
    },
    {
      id: "6-2",
      chatId: "6",
      senderId: "6",
      text: "Ладно, понял тебя",
      time: "вчера 14:10",
      status: "read",
      isOwn: false,
    },
  ],
  "7": [
    {
      id: "7-1",
      chatId: "7",
      senderId: "7",
      text: "Привет! Пришли ссылку на документацию, пожалуйста",
      time: "пн 10:30",
      status: "read",
      isOwn: false,
    },
  ],
  "8": [
    {
      id: "8-1",
      chatId: "8",
      senderId: "other1",
      text: "Готово, смотрите файл в облаке",
      time: "пн 15:00",
      status: "read",
      isOwn: false,
    },
  ],
};

export const senderNames: Record<string, string> = {
  "1": "Алиса",
  "3": "Дмитрий",
  "5": "Мария",
  "6": "Сергей",
  "7": "Анна",
  other1: "Максим",
  other2: "Никита",
  other3: "Максим",
};

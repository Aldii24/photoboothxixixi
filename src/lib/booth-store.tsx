"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BEAUTY_FILTERS,
  DEFAULT_SHOTS,
  FOOTER_FONTS,
  FRAME_COLORS,
  GRID_OVERLAYS,
  type BeautyFilter,
  type FrameColor,
  type GridOverlay,
  type TimerOption,
} from "@/lib/booth-config";
import {
  defaultFrameForCount,
  getFrameById,
  type CountFrame,
} from "@/lib/frame-catalog";

export type PlacedSticker = {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

type BoothState = {
  timer: TimerOption;
  setTimer: (t: TimerOption) => void;
  grid: GridOverlay;
  setGrid: (g: GridOverlay) => void;
  beauty: BeautyFilter;
  setBeauty: (f: BeautyFilter) => void;
  shotCount: number;
  setShotCount: (n: number) => void;
  shots: (string | null)[];
  setShotAt: (index: number, dataUrl: string | null) => void;
  setShots: (shots: (string | null)[]) => void;
  frameColor: FrameColor;
  setFrameColor: (c: FrameColor) => void;
  /** Active frame template (matches shotCount) */
  frame: CountFrame;
  setFrame: (f: CountFrame) => void;
  caption: string;
  setCaption: (v: string) => void;
  showCaption: boolean;
  setShowCaption: (v: boolean) => void;
  showDate: boolean;
  setShowDate: (v: boolean) => void;
  fontId: string;
  setFontId: (v: string) => void;
  placedStickers: PlacedSticker[];
  addSticker: (stickerId: string, pos?: { x: number; y: number }) => void;
  updateSticker: (id: string, patch: Partial<PlacedSticker>) => void;
  removeSticker: (id: string) => void;
  clearStickers: () => void;
  retakeIndex: number | null;
  setRetakeIndex: (i: number | null) => void;
};

const BoothContext = createContext<BoothState | null>(null);

const STORAGE_SHOTS = "photobox-shots-v2";

function loadShots(): (string | null)[] {
  if (typeof window === "undefined") return Array(DEFAULT_SHOTS).fill(null);
  try {
    const raw = sessionStorage.getItem(STORAGE_SHOTS);
    if (raw) return JSON.parse(raw) as (string | null)[];
  } catch {
    /* ignore */
  }
  return Array(DEFAULT_SHOTS).fill(null);
}

function saveShots(shots: (string | null)[]) {
  try {
    sessionStorage.setItem(STORAGE_SHOTS, JSON.stringify(shots));
  } catch {
    /* quota */
  }
}

export function BoothProvider({ children }: { children: ReactNode }) {
  const [timer, setTimer] = useState<TimerOption>(3);
  const [grid, setGrid] = useState<GridOverlay>(GRID_OVERLAYS[1]);
  const [beauty, setBeauty] = useState<BeautyFilter>(BEAUTY_FILTERS[1]);
  const [shotCount, setShotCountState] = useState(DEFAULT_SHOTS);
  const [shots, setShotsState] = useState<(string | null)[]>(loadShots);
  const [frameColor, setFrameColor] = useState<FrameColor>(FRAME_COLORS[0]);
  const [frame, setFrame] = useState<CountFrame>(() =>
    defaultFrameForCount(DEFAULT_SHOTS),
  );
  const [caption, setCaption] = useState("");
  const [showCaption, setShowCaption] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [fontId, setFontId] = useState(FOOTER_FONTS[0].id);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  // Keep frame in sync with catalog (regen assets / shot count / stale id)
  useEffect(() => {
    const fresh = getFrameById(frame.id);
    if (!fresh || fresh.shots !== shotCount) {
      setFrame(defaultFrameForCount(shotCount));
      return;
    }
    if (
      fresh.overlay !== frame.overlay ||
      fresh.slots[0]?.w !== frame.slots[0]?.w
    ) {
      setFrame(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when count or frame id changes
  }, [shotCount, frame.id]);

  const setShots = useCallback((next: (string | null)[]) => {
    setShotsState(next);
    saveShots(next);
  }, []);

  const setShotAt = useCallback((index: number, dataUrl: string | null) => {
    setShotsState((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(null);
      next[index] = dataUrl;
      saveShots(next);
      return next;
    });
  }, []);

  const setShotCount = useCallback((n: number) => {
    setShotCountState(n);
    setShotsState((prev) => {
      const next = Array.from({ length: n }, (_, i) => prev[i] ?? null);
      saveShots(next);
      return next;
    });
    setFrame(defaultFrameForCount(n));
  }, []);

  const addSticker = useCallback(
    (stickerId: string, pos?: { x: number; y: number }) => {
      setPlacedStickers((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          stickerId,
          x: pos?.x ?? 30 + Math.random() * 30,
          y: pos?.y ?? 20 + Math.random() * 40,
          scale: 1,
          rotate: -10 + Math.random() * 20,
        },
      ]);
    },
    [],
  );

  const updateSticker = useCallback(
    (id: string, patch: Partial<PlacedSticker>) => {
      setPlacedStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [],
  );

  const removeSticker = useCallback((id: string) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearStickers = useCallback(() => setPlacedStickers([]), []);

  const value = useMemo(
    () => ({
      timer,
      setTimer,
      grid,
      setGrid,
      beauty,
      setBeauty,
      shotCount,
      setShotCount,
      shots,
      setShotAt,
      setShots,
      frameColor,
      setFrameColor,
      frame,
      setFrame,
      caption,
      setCaption,
      showCaption,
      setShowCaption,
      showDate,
      setShowDate,
      fontId,
      setFontId,
      placedStickers,
      addSticker,
      updateSticker,
      removeSticker,
      clearStickers,
      retakeIndex,
      setRetakeIndex,
    }),
    [
      timer,
      grid,
      beauty,
      shotCount,
      setShotCount,
      shots,
      setShotAt,
      setShots,
      frameColor,
      frame,
      caption,
      showCaption,
      showDate,
      fontId,
      placedStickers,
      addSticker,
      updateSticker,
      removeSticker,
      clearStickers,
      retakeIndex,
    ],
  );

  return (
    <BoothContext.Provider value={value}>{children}</BoothContext.Provider>
  );
}

export function useBooth() {
  const ctx = useContext(BoothContext);
  if (!ctx) throw new Error("useBooth must be used within BoothProvider");
  return ctx;
}

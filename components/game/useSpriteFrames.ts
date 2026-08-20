"use client";

import { useEffect, useState } from "react";
import { CanvasTexture, NearestFilter, SRGBColorSpace } from "three";

function keyOutBlack(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 18 && data[i + 1] < 18 && data[i + 2] < 18) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

export function useSpriteFrames(urls: string[]) {
  const [textures, setTextures] = useState<CanvasTexture[] | null>(null);
  const key = urls.join("|");

  useEffect(() => {
    const list = key.split("|");
    let cancelled = false;
    const created: CanvasTexture[] = [];

    Promise.all(
      list.map(
        (url) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load ${url}`));
            image.src = url;
          }),
      ),
    )
      .then((images) => {
        if (cancelled) return;
        const next = images.map((image) => {
          const texture = new CanvasTexture(keyOutBlack(image));
          texture.magFilter = NearestFilter;
          texture.minFilter = NearestFilter;
          texture.colorSpace = SRGBColorSpace;
          texture.needsUpdate = true;
          created.push(texture);
          return texture;
        });
        setTextures(next);
      })
      .catch(() => {
        if (!cancelled) setTextures(null);
      });

    return () => {
      cancelled = true;
      created.forEach((texture) => texture.dispose());
    };
  }, [key]);

  return textures;
}

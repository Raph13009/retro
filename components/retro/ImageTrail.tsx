"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./ImageTrail.module.css";

type Point = {
  x: number;
  y: number;
};

type PointerEventLike = MouseEvent | TouchEvent;
type ImageTrailVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type TrailDom = {
  el: HTMLElement;
  inner: HTMLElement;
};

function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(event: PointerEventLike, rect: DOMRect): Point {
  let clientX = 0;
  let clientY = 0;

  if ("touches" in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if ("clientX" in event) {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function getMouseDistance(p1: Point, p2: Point) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

function getNewPosition(position: number, offset: number, arr: ImageItem[]) {
  const realOffset = Math.abs(offset) % arr.length;

  if (position - realOffset >= 0) {
    return position - realOffset;
  }

  return arr.length - (realOffset - position);
}

class ImageItem {
  DOM: TrailDom;
  defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
  rect: DOMRect;
  private resizeHandler: () => void;

  constructor(DOMEl: HTMLElement) {
    const inner = DOMEl.querySelector<HTMLElement>("[data-image-trail-inner]");

    if (!inner) {
      throw new Error("ImageTrail image is missing an inner element.");
    }

    this.DOM = { el: DOMEl, inner };
    this.rect = this.DOM.el.getBoundingClientRect();
    this.resizeHandler = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener("resize", this.resizeHandler);
  }

  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }

  destroy() {
    window.removeEventListener("resize", this.resizeHandler);
    gsap.killTweensOf([this.DOM.el, this.DOM.inner]);
  }
}

abstract class ImageTrailBase {
  container: HTMLElement;
  DOM: { el: HTMLElement };
  images: ImageItem[];
  imagesTotal: number;
  imgPosition = 0;
  zIndexVal = 1;
  activeImagesCount = 0;
  isIdle = true;
  threshold = 80;
  mousePos: Point = { x: 0, y: 0 };
  lastMousePos: Point = { x: 0, y: 0 };
  cacheMousePos: Point = { x: 0, y: 0 };

  private hasPointer = false;
  private isDestroyed = false;
  private renderFrame = 0;
  private handlePointerMove: (event: PointerEventLike) => void;
  private initRender: (event: PointerEventLike) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll<HTMLElement>("[data-image-trail-img]")].map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;

    this.handlePointerMove = (event) => {
      const rect = this.container.getBoundingClientRect();
      const pointer = getLocalPointerPos(event, rect);
      const isInside = pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;

      this.hasPointer = isInside;

      if (isInside) {
        this.mousePos = pointer;
      }
    };

    this.initRender = (event) => {
      this.handlePointerMove(event);

      if (!this.hasPointer || this.renderFrame) {
        return;
      }

      this.cacheMousePos = { ...this.mousePos };
      this.renderFrame = requestAnimationFrame(() => this.render());
      this.removeInitListeners();
    };

    window.addEventListener("mousemove", this.handlePointerMove, { passive: true });
    window.addEventListener("touchmove", this.handlePointerMove, { passive: true });
    window.addEventListener("mousemove", this.initRender, { passive: true });
    window.addEventListener("touchmove", this.initRender, { passive: true });
  }

  destroy() {
    this.isDestroyed = true;
    window.removeEventListener("mousemove", this.handlePointerMove);
    window.removeEventListener("touchmove", this.handlePointerMove);
    this.removeInitListeners();

    if (this.renderFrame) {
      cancelAnimationFrame(this.renderFrame);
    }

    this.images.forEach((image) => image.destroy());
    gsap.killTweensOf(this.DOM.el);
  }

  protected updateCachedPointer(amount: number) {
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, amount);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, amount);
  }

  protected getNextImage() {
    this.zIndexVal++;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    return this.images[this.imgPosition];
  }

  protected onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }

  protected onImageDeactivated() {
    this.activeImagesCount--;

    if (this.activeImagesCount === 0) {
      this.isIdle = true;
    }
  }

  protected render() {
    if (this.isDestroyed) {
      return;
    }

    if (this.hasPointer && this.imagesTotal > 0) {
      const distance = getMouseDistance(this.mousePos, this.lastMousePos);
      this.updateCachedPointer(this.getLerpAmount());

      if (distance > this.threshold) {
        this.showNextImage();
        this.lastMousePos = { ...this.mousePos };
      }
    }

    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }

    this.renderFrame = requestAnimationFrame(() => this.render());
  }

  protected getLerpAmount() {
    return 0.1;
  }

  private removeInitListeners() {
    window.removeEventListener("mousemove", this.initRender);
    window.removeEventListener("touchmove", this.initRender);
  }

  abstract showNextImage(): void;
}

class ImageTrailVariant1 extends ImageTrailBase {
  showNextImage() {
    const img = this.getNextImage();
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: "power1",
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: "power3",
          opacity: 0,
          scale: 0.2
        },
        0.4
      );
  }
}

class ImageTrailVariant2 extends ImageTrailBase {
  showNextImage() {
    const img = this.getNextImage();
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2.8,
          filter: "brightness(250%)"
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          filter: "brightness(100%)"
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: "power2",
          opacity: 0,
          scale: 0.2
        },
        0.45
      );
  }
}

class ImageTrailVariant3 extends ImageTrailBase {
  showNextImage() {
    const img = this.getNextImage();
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          xPercent: 0,
          yPercent: 0,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 1.2
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.6,
          ease: "power2",
          opacity: 0,
          scale: 0.2,
          xPercent: () => gsap.utils.random(-30, 30),
          yPercent: -200
        },
        0.6
      );
  }
}

class ImageTrailVariant4 extends ImageTrailBase {
  showNextImage() {
    const img = this.getNextImage();
    gsap.killTweensOf(img.DOM.el);

    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }

    dx *= distance / 100;
    dy *= distance / 100;

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2,
          filter: `brightness(${Math.max((400 * distance) / 100, 100)}%) contrast(${Math.max(
            (400 * distance) / 100,
            100
          )}%)`
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          filter: "brightness(100%) contrast(100%)"
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: "power3",
          opacity: 0
        },
        0.4
      )
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: "power4",
          x: `+=${dx * 110}`,
          y: `+=${dy * 110}`
        },
        0.05
      );
  }
}

class ImageTrailVariant5 extends ImageTrailBase {
  private lastAngle = 0;

  showNextImage() {
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle < 0) {
      angle += 360;
    }

    if (angle > 90 && angle <= 270) {
      angle += 180;
    }

    const isMovingClockwise = angle >= this.lastAngle;
    this.lastAngle = angle;
    const startAngle = isMovingClockwise ? angle - 10 : angle + 10;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }

    dx *= distance / 150;
    dy *= distance / 150;

    const img = this.getNextImage();
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          filter: "brightness(80%)",
          scale: 0.1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
          rotation: startAngle
        },
        {
          duration: 1,
          ease: "power2",
          scale: 1,
          filter: "brightness(100%)",
          x: this.mousePos.x - img.rect.width / 2 + dx * 70,
          y: this.mousePos.y - img.rect.height / 2 + dy * 70,
          rotation: this.lastAngle
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: "expo",
          opacity: 0
        },
        0.5
      )
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: "power4",
          x: `+=${dx * 120}`,
          y: `+=${dy * 120}`
        },
        0.05
      );
  }
}

class ImageTrailVariant6 extends ImageTrailBase {
  protected getLerpAmount() {
    return 0.3;
  }

  showNextImage() {
    const dx = this.mousePos.x - this.cacheMousePos.x;
    const dy = this.mousePos.y - this.cacheMousePos.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const img = this.getNextImage();
    const scaleFactor = this.mapSpeed(speed, 0.3, 2, 200);
    const brightnessValue = this.mapSpeed(speed, 0, 1.3, 70);
    const blurValue = this.mapSpeed(speed, 20, 0, 90);
    const grayscaleValue = this.mapSpeed(speed, 600, 0, 90);

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.8,
          ease: "power3",
          scale: scaleFactor,
          filter: `grayscale(${grayscaleValue * 100}%) brightness(${brightnessValue * 100}%) blur(${blurValue}px)`,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2
        },
        {
          duration: 0.8,
          ease: "power3",
          scale: 1
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: "power3.in",
          opacity: 0,
          scale: 0.2
        },
        0.45
      );
  }

  private mapSpeed(speed: number, min: number, max: number, maxSpeed: number) {
    return min + (max - min) * Math.min(speed / maxSpeed, 1);
  }
}

class ImageTrailVariant7 extends ImageTrailBase {
  private visibleImagesCount = 0;
  private visibleImagesTotal: number;

  constructor(container: HTMLElement) {
    super(container);
    this.visibleImagesTotal = Math.min(9, this.imagesTotal - 1);
  }

  protected getLerpAmount() {
    return 0.3;
  }

  showNextImage() {
    const img = this.getNextImage();
    this.visibleImagesCount++;

    gsap.killTweensOf(img.DOM.el);
    const scaleValue = gsap.utils.random(0.5, 1.6);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .fromTo(
        img.DOM.el,
        {
          scale: scaleValue - Math.max(gsap.utils.random(0.2, 0.6), 0),
          rotationZ: 0,
          opacity: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2
        },
        {
          duration: 0.4,
          ease: "power3",
          scale: scaleValue,
          rotationZ: gsap.utils.random(-3, 3),
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2
        },
        0
      );

    if (this.visibleImagesCount >= this.visibleImagesTotal) {
      const lastInQueue = getNewPosition(this.imgPosition, this.visibleImagesTotal, this.images);
      const oldImg = this.images[lastInQueue];

      gsap.to(oldImg.DOM.el, {
        duration: 0.4,
        ease: "power4",
        opacity: 0,
        scale: 1.3,
        onComplete: () => {
          if (this.activeImagesCount === 0) {
            this.isIdle = true;
          }
        }
      });
    }
  }

  protected onImageDeactivated() {
    this.activeImagesCount--;
  }
}

class ImageTrailVariant8 extends ImageTrailBase {
  private rotation: Point = { x: 0, y: 0 };
  private cachedRotation: Point = { x: 0, y: 0 };
  private zValue = 0;
  private cachedZValue = 0;

  showNextImage() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const relX = this.mousePos.x - centerX;
    const relY = this.mousePos.y - centerY;

    this.rotation.x = -(relY / centerY) * 30;
    this.rotation.y = (relX / centerX) * 30;
    this.cachedRotation = { ...this.rotation };

    const distanceFromCenter = Math.sqrt(relX * relX + relY * relY);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const proportion = distanceFromCenter / maxDistance;
    this.zValue = proportion * 1200 - 600;
    this.cachedZValue = this.zValue;

    const normalizedZ = (this.zValue + 600) / 1200;
    const brightness = 0.2 + normalizedZ * 2.3;
    const img = this.getNextImage();

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated()
      })
      .set(this.DOM.el, { perspective: 1000 }, 0)
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          z: 0,
          scale: 1 + this.cachedZValue / 1000,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
          rotationX: this.cachedRotation.x,
          rotationY: this.cachedRotation.y,
          filter: `brightness(${brightness})`
        },
        {
          duration: 1,
          ease: "expo",
          scale: 1 + this.zValue / 1000,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
          rotationX: this.rotation.x,
          rotationY: this.rotation.y
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: "power2",
          opacity: 0,
          z: -800
        },
        0.3
      );
  }
}

type ImageTrailController = new (container: HTMLElement) => ImageTrailBase;

const variantMap: Record<ImageTrailVariant, ImageTrailController> = {
  1: ImageTrailVariant1,
  2: ImageTrailVariant2,
  3: ImageTrailVariant3,
  4: ImageTrailVariant4,
  5: ImageTrailVariant5,
  6: ImageTrailVariant6,
  7: ImageTrailVariant7,
  8: ImageTrailVariant8
};

type ImageTrailProps = {
  items?: string[];
  variant?: ImageTrailVariant;
  className?: string;
};

export function ImageTrail({ items = [], variant = 1, className }: ImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const Cls = variantMap[variant] ?? variantMap[1];
    const instance = new Cls(containerRef.current);

    return () => instance.destroy();
  }, [variant, items]);

  return (
    <div
      aria-hidden="true"
      className={className ? `${styles.content} ${className}` : styles.content}
      ref={containerRef}
    >
      {items.map((url) => (
        <div className={styles.contentImg} data-image-trail-img key={url}>
          <div
            className={styles.contentImgInner}
            data-image-trail-inner
            style={{ backgroundImage: `url("${url}")` }}
          />
        </div>
      ))}
    </div>
  );
}

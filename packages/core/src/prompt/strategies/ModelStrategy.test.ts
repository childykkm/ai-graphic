import { describe, expect, it } from 'vitest';
import { SharedPromptParts } from '../SharedPromptParts';
import type { UnifiedPromptInput } from '../types';
import { ModelStrategy } from './ModelStrategy';

// ─── Test Helpers ────────────────────────────────────────────────────────────

function createBaseInput(overrides: Partial<UnifiedPromptInput> = {}): UnifiedPromptInput {
  return {
    activeTab: 'model' as UnifiedPromptInput['activeTab'],
    customPrompt: '',
    imagesPerShot: 1,
    gazeVariation: 5,
    poseVariation: 5,
    viewVariation: 5,
    graphicFrontImages: [],
    graphicBackImages: [],
    graphicNecklineImages: [],
    graphicLogoImages: [],
    graphicDetailImages: [],
    graphicOtherImages: [],
    refModelImages: [],
    bgImages: [],
    floorStyle: 'flat-lay' as UnifiedPromptInput['floorStyle'],
    floorBgColor: '#FFFFFF',
    floorFrontImages: [],
    floorBackImages: [],
    floorNecklineImages: [],
    floorLogoImages: [],
    floorDetailImages: [],
    modelBgColor: '#FFFFFF',
    modelReferenceImages: [],
    shotIndex: 0,
    personCount: 1,
    multiPersonImages: [],
    multiPersonLogoImages: [],
    multiBackgroundImages: [],
    mood: '',
    variationImages: [],
    variationNecklineImages: [],
    variationLogoImages: [],
    variationDetailImages: [],
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ModelStrategy', () => {
  const strategy = new ModelStrategy();
  const shared = new SharedPromptParts();

  describe('shot prompts based on shotIndex', () => {
    it('should produce CUT 01 — Extreme Close-Up Portrait for shotIndex 0', () => {
      const input = createBaseInput({ shotIndex: 0 });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('CUT 01 — Extreme Close-Up Portrait');
      expect(result.text).toContain('face and upper chest');
    });

    it('should produce CUT 02 — Full-Body Shot for shotIndex 1', () => {
      const input = createBaseInput({ shotIndex: 1 });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('CUT 02 — Full-Body Shot');
      expect(result.text).toContain('head to toe');
    });

    it('should produce CUT 03 — 90-Degree Side Profile for shotIndex 2', () => {
      const input = createBaseInput({ shotIndex: 2 });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('CUT 03 — 90-Degree Side Profile');
      expect(result.text).toContain('exact side view');
    });

    it('should produce CUT 04 — Rear View Shot for shotIndex 3', () => {
      const input = createBaseInput({ shotIndex: 3 });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('CUT 04 — Rear View Shot');
      expect(result.text).toContain('back view showing');
    });

    it('should default to shot 0 when shotIndex is undefined', () => {
      const input = createBaseInput({ shotIndex: undefined });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('CUT 01 — Extreme Close-Up Portrait');
    });
  });

  describe('identity consistency instructions', () => {
    it('should include identity consistency instruction', () => {
      const input = createBaseInput({ shotIndex: 0 });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain(
        '100% faithful reproduction of the reference model\'s face, hair, skin tone, body type, and outfit across all shots',
      );
    });
  });

  describe('background color instruction', () => {
    it('should include modelBgColor hex in the prompt', () => {
      const input = createBaseInput({ modelBgColor: '#3B82F6' });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('#3B82F6');
      expect(result.text).toContain('Blue');
    });

    it('should handle unknown hex codes by showing the hex value', () => {
      const input = createBaseInput({ modelBgColor: '#ABC123' });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('#ABC123');
    });
  });

  describe('shared prompt parts integration', () => {
    it('should include quality prompt from SharedPromptParts', () => {
      const input = createBaseInput();
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('[Image Quality Standards]');
    });

    it('should include custom prompt section when provided', () => {
      const input = createBaseInput({ customPrompt: 'Wear sunglasses' });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('Wear sunglasses');
      expect(result.text).toContain('[Custom Instructions');
    });

    it('should not include custom prompt section when empty', () => {
      const input = createBaseInput({ customPrompt: '' });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).not.toContain('[Custom Instructions');
    });

    it('should include final constraint', () => {
      const input = createBaseInput();
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).toContain('[Final Constraint]');
    });
  });

  describe('image parts from modelReferenceImages', () => {
    it('should build image parts from modelReferenceImages', () => {
      const input = createBaseInput({
        modelReferenceImages: [
          { base64: 'img1data', mimeType: 'image/png', fileName: 'ref1.png' },
          { base64: 'img2data', mimeType: 'image/jpeg', fileName: 'ref2.jpg' },
        ],
      });
      const result = strategy.buildPrompt(input, shared);

      expect(result.imageParts).toHaveLength(2);
      expect(result.imageParts[0].data).toBe('img1data');
      expect(result.imageParts[0].mimeType).toBe('image/png');
      expect(result.imageParts[1].data).toBe('img2data');
      expect(result.imageParts[1].mimeType).toBe('image/jpeg');
      expect(result.imageParts[0].label).toContain('REFERENCE MODEL IMAGES');
    });

    it('should return empty imageParts when no modelReferenceImages', () => {
      const input = createBaseInput({ modelReferenceImages: [] });
      const result = strategy.buildPrompt(input, shared);

      expect(result.imageParts).toHaveLength(0);
    });
  });

  describe('Model mode does NOT use gaze/pose/view sliders', () => {
    it('should not include gaze/pose/view variation instructions', () => {
      const input = createBaseInput({
        gazeVariation: 10,
        poseVariation: 10,
        viewVariation: 10,
      });
      const result = strategy.buildPrompt(input, shared);

      expect(result.text).not.toContain('[Gaze');
      expect(result.text).not.toContain('[Pose');
      expect(result.text).not.toContain('[Camera View');
    });
  });

  describe('prompt is all English', () => {
    it('should produce English-only prompt text', () => {
      const input = createBaseInput({ shotIndex: 1, modelBgColor: '#FFFFFF' });
      const result = strategy.buildPrompt(input, shared);

      // Check that the text does not contain Korean characters
      const koreanRegex = /[\u3131-\u3163\uac00-\ud7a3]/;
      expect(koreanRegex.test(result.text)).toBe(false);
    });
  });
});

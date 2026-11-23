import React from 'react';
import { AvatarConfig } from '../types/game';
import { CLOTHES_CATALOG, JEWELRY_CATALOG } from '../data/gameCatalog';

interface ArtistAvatarProps {
  avatar: AvatarConfig;
  size?: number;
  className?: string;
}

export const ArtistAvatar: React.FC<ArtistAvatarProps> = ({
  avatar,
  size = 180,
  className = '',
}) => {
  const outfit = CLOTHES_CATALOG.find((c) => c.id === avatar.outfitId);
  const visualKey = outfit?.visualKey || 'tank_white';
  const equippedJewelry = JEWELRY_CATALOG.filter((j) =>
    avatar.jewelryIds.includes(j.id)
  );
  const hasGoldChain = equippedJewelry.some(
    (j) => j.visualKey === 'gold_chain' || j.visualKey === 'cuban'
  );
  const hasDiamondChain = equippedJewelry.some(
    (j) => j.visualKey === 'diamond_chain' || j.visualKey === 'silver_chain'
  );

  const skin = avatar.skinTone || '#c69072';
  const hair = avatar.hairColor || '#1e1b18';

  const getOutfitColors = () => {
    switch (visualKey) {
      case 'tee_black':
        return { main: '#18181b', accent: '#27272a', isTank: false };
      case 'hoodie_dark':
        return { main: '#272936', accent: '#3f4356', isTank: false, isHoodie: true };
      case 'tee_vintage':
        return { main: '#3f3b38', accent: '#d6d3d1', isTank: false };
      case 'track_emerald':
        return { main: '#065f46', accent: '#10b981', isTank: false, isJacket: true };
      case 'denim':
        return { main: '#1d4ed8', accent: '#93c5fd', isTank: false, isJacket: true };
      case 'varsity_red':
        return { main: '#991b1b', accent: '#f8fafc', isTank: false, isJacket: true };
      case 'leather':
        return { main: '#111217', accent: '#52525b', isTank: false, isJacket: true };
      case 'silk_shirt':
        return { main: '#4c1d95', accent: '#c4b5fd', isTank: false };
      case 'trench':
        return { main: '#785a3c', accent: '#a8845d', isTank: false, isJacket: true };
      case 'blazer_velvet':
        return { main: '#4c0519', accent: '#fb7185', isTank: false, isJacket: true };
      case 'tuxedo':
        return { main: '#09090b', accent: '#f8fafc', isTank: false, isSuit: true };
      default:
        return { main: '#f8fafc', accent: '#e2e8f0', isTank: true };
    }
  };

  const outfitStyle = getOutfitColors();

  return (
    <svg
      width={size}
      height={size * 1.18}
      viewBox="0 0 220 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular Aura Behind Head */}
      <circle cx="110" cy="112" r="88" fill={avatar.auraColor || '#2d4a35'} />

      {/* Back Hair for Long / Afro */}
      {avatar.hairStyle === 'afro' && (
        <circle cx="110" cy="84" r="60" fill={hair} stroke="#141418" strokeWidth="3" />
      )}
      {avatar.hairStyle === 'long' && (
        <path
          d="M54 92C50 130 52 175 64 195H156C168 175 170 130 166 92C162 56 140 36 110 36C80 36 58 56 54 92Z"
          fill={hair}
          stroke="#141418"
          strokeWidth="3"
        />
      )}

      {/* Neck & Shoulders / Arms */}
      <path
        d="M89 156V184H131V156H89Z"
        fill={skin}
        stroke="#141418"
        strokeWidth="3"
      />
      {/* Subtle neck shadow */}
      <path d="M90 160C98 168 122 168 130 160V154H90V160Z" fill="#000000" fillOpacity="0.16" />

      {/* Arms / Body Base */}
      <path
        d="M50 258L58 196C61 181 74 172 90 170H130C146 172 159 181 162 196L170 258H50Z"
        fill={skin}
        stroke="#141418"
        strokeWidth="3"
      />

      {/* Outfit Layer */}
      {outfitStyle.isTank ? (
        <path
          d="M71 174L84 170C92 184 128 184 136 170L149 174L144 258H76L71 174Z"
          fill={outfitStyle.main}
          stroke="#141418"
          strokeWidth="3"
        />
      ) : (
        <path
          d="M52 258L59 194C62 180 75 171 91 169C98 179 122 179 129 169C145 171 158 180 161 194L168 258H52Z"
          fill={outfitStyle.main}
          stroke="#141418"
          strokeWidth="3"
        />
      )}

      {/* Outfit Details (Jacket Collar / Hoodie Strings / Suit Lapel) */}
      {outfitStyle.isJacket && (
        <>
          <path d="M92 170L110 212L128 170" fill="#18181b" stroke="#141418" strokeWidth="2.5" />
          <path d="M84 172L96 205" stroke={outfitStyle.accent} strokeWidth="3" strokeLinecap="round" />
          <path d="M136 172L124 205" stroke={outfitStyle.accent} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {outfitStyle.isHoodie && (
        <>
          <path d="M98 184V218" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M122 184V218" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {outfitStyle.isSuit && (
        <>
          <path d="M95 170L110 218L125 170H95Z" fill="#f8fafc" stroke="#141418" strokeWidth="2" />
          <path d="M104 178L110 184L116 178L110 174L104 178Z" fill="#18181b" />
        </>
      )}

      {/* Equipped Jewelry */}
      {(hasGoldChain || hasDiamondChain) && (
        <path
          d="M84 174C92 198 128 198 136 174"
          stroke={hasGoldChain ? '#facc15' : '#e2e8f0'}
          strokeWidth={hasGoldChain ? '5.5' : '4'}
          strokeLinecap="round"
        />
      )}
      {hasDiamondChain && (
        <polygon
          points="110,192 116,200 110,208 104,200"
          fill="#bae6fd"
          stroke="#0f172a"
          strokeWidth="1.8"
        />
      )}

      {/* Ears */}
      <path
        d="M64 102C55 100 53 118 61 124C65 126 68 124 68 120"
        fill={skin}
        stroke="#141418"
        strokeWidth="3"
      />
      <path d="M60 109C59 113 60 117 63 118" stroke="#141418" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M156 102C165 100 167 118 159 124C155 126 152 124 152 120"
        fill={skin}
        stroke="#141418"
        strokeWidth="3"
      />
      <path d="M160 109C161 113 160 117 157 118" stroke="#141418" strokeWidth="2" strokeLinecap="round" />

      {/* Head Contour */}
      <path
        d="M65 92C65 60 83 45 110 45C137 45 155 60 155 92C155 116 149 132 138 145C129 156 121 163 110 163C99 163 91 156 82 145C71 132 65 116 65 92Z"
        fill={skin}
        stroke="#141418"
        strokeWidth="3"
      />

      {/* Forehead / Brow Tone */}
      <path
        d="M72 86C74 72 88 64 110 64C132 64 146 72 148 86"
        stroke="#000000"
        strokeOpacity="0.06"
        strokeWidth="2"
      />

      {/* Hairstyles */}
      {avatar.hairStyle === 'buzz' && (
        <path
          d="M66 88C68 58 84 44 110 44C136 44 152 58 154 88C145 72 132 68 110 68C88 68 75 72 66 88Z"
          fill={hair}
          stroke="#141418"
          strokeWidth="2.5"
        />
      )}
      {avatar.hairStyle === 'waves' && (
        <path
          d="M65 88C66 56 84 42 110 42C136 42 154 56 155 88C146 74 134 70 110 70C86 70 74 74 65 88Z"
          fill={hair}
          stroke="#141418"
          strokeWidth="3"
        />
      )}
      {avatar.hairStyle === 'curly' && (
        <path
          d="M64 85C58 68 68 48 84 42C94 34 126 34 136 42C152 48 162 68 156 85C144 74 128 72 110 72C92 72 76 74 64 85Z"
          fill={hair}
          stroke="#141418"
          strokeWidth="3"
        />
      )}
      {avatar.hairStyle === 'spiky' && (
        <path
          d="M66 88L60 64L78 66L86 38L104 54L116 32L130 54L146 42L144 68L158 68L153 88C140 74 126 70 110 70C94 70 80 74 66 88Z"
          fill={hair}
          stroke="#141418"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
      {avatar.hairStyle === 'dreads' && (
        <g fill={hair} stroke="#141418" strokeWidth="2.5">
          <rect x="60" y="64" width="12" height="58" rx="6" />
          <rect x="72" y="48" width="12" height="44" rx="6" />
          <rect x="86" y="40" width="12" height="36" rx="6" />
          <rect x="102" y="38" width="12" height="36" rx="6" />
          <rect x="118" y="40" width="12" height="36" rx="6" />
          <rect x="132" y="48" width="12" height="44" rx="6" />
          <rect x="146" y="64" width="12" height="58" rx="6" />
        </g>
      )}

      {/* Brows */}
      <path d="M76 92C83 89 92 90 99 93" stroke="#141418" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M121 93C128 90 137 89 144 92" stroke="#141418" strokeWidth="2.8" strokeLinecap="round" />

      {/* Expressive Half-Lidded Eyes matching reference screenshot */}
      <g>
        {/* Left Eye */}
        <path
          d="M76 99C82 95 94 95 100 100C98 108 81 108 76 99Z"
          fill="#ffffff"
          stroke="#141418"
          strokeWidth="2.4"
        />
        <circle cx="88" cy="100" r="4.8" fill="#2c1810" />
        <circle cx="88" cy="100" r="2.2" fill="#09090b" />
        <circle cx="89.5" cy="98.5" r="1.2" fill="#ffffff" />
        <path d="M75 98C82 95 94 95 101 99" stroke="#141418" strokeWidth="3.2" strokeLinecap="round" />

        {/* Right Eye */}
        <path
          d="M120 100C126 95 138 95 144 99C139 108 122 108 120 100Z"
          fill="#ffffff"
          stroke="#141418"
          strokeWidth="2.4"
        />
        <circle cx="132" cy="100" r="4.8" fill="#2c1810" />
        <circle cx="132" cy="100" r="2.2" fill="#09090b" />
        <circle cx="133.5" cy="98.5" r="1.2" fill="#ffffff" />
        <path d="M119 99C126 95 138 95 145 98" stroke="#141418" strokeWidth="3.2" strokeLinecap="round" />
      </g>

      {/* Nose */}
      <path
        d="M101 119C103 114 117 114 119 119"
        stroke="#141418"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M104 120C106 122 107 122 108 120" stroke="#141418" strokeWidth="2" strokeLinecap="round" />
      <path d="M112 120C113 122 114 122 116 120" stroke="#141418" strokeWidth="2" strokeLinecap="round" />

      {/* Facial Hair */}
      {avatar.facialHair === 'stubble' && (
        <path
          d="M78 134C86 151 98 158 110 158C122 158 134 151 142 134"
          stroke="#1e1b18"
          strokeOpacity="0.35"
          strokeWidth="5"
          strokeDasharray="2 3"
          strokeLinecap="round"
        />
      )}
      {avatar.facialHair === 'goatee' && (
        <path
          d="M98 138C98 132 122 132 122 138C122 152 116 159 110 159C104 159 98 152 98 138Z"
          fill={hair}
          fillOpacity="0.88"
        />
      )}
      {avatar.facialHair === 'beard' && (
        <path
          d="M70 120C72 146 90 164 110 164C130 164 148 146 150 120C142 134 128 142 110 142C92 142 78 134 70 120Z"
          fill={hair}
          stroke="#141418"
          strokeWidth="2.5"
        />
      )}

      {/* Mouth */}
      <path
        d="M99 138C105 140 115 140 121 138"
        stroke="#141418"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M107 144C109 145 111 145 113 144" stroke="#141418" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />

      {/* Eyewear */}
      {avatar.eyewear === 'shades' && (
        <g>
          <rect x="71" y="92" width="32" height="16" rx="5" fill="#09090b" stroke="#27272a" strokeWidth="2.5" />
          <rect x="117" y="92" width="32" height="16" rx="5" fill="#09090b" stroke="#27272a" strokeWidth="2.5" />
          <path d="M103 98H117" stroke="#27272a" strokeWidth="2.8" />
          <path d="M76 96L86 104" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
          <path d="M122 96L132 104" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {avatar.eyewear === 'round' && (
        <g>
          <circle cx="88" cy="100" r="14" fill="#0ea5e9" fillOpacity="0.14" stroke="#d4af37" strokeWidth="2.5" />
          <circle cx="132" cy="100" r="14" fill="#0ea5e9" fillOpacity="0.14" stroke="#d4af37" strokeWidth="2.5" />
          <path d="M102 100H118" stroke="#d4af37" strokeWidth="2.5" />
        </g>
      )}
      {avatar.eyewear === 'designer' && (
        <g>
          <path d="M70 94H104L100 110H74L70 94Z" fill="#18181b" fillOpacity="0.88" stroke="#e4e4e7" strokeWidth="2" />
          <path d="M116 94H150L146 110H120L116 94Z" fill="#18181b" fillOpacity="0.88" stroke="#e4e4e7" strokeWidth="2" />
          <path d="M104 97H116" stroke="#e4e4e7" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
};

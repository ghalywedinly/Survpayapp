import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function base(paths: React.ReactNode) {
  return function Icon({ className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const ArrowRightIcon = base(<path d="M5 12h14M13 6l6 6-6 6" />);
export const CheckIcon = base(<path d="M20 6L9 17l-5-5" />);
export const CheckCircleIcon = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.4 2.4L16 9.5" />
  </>
);
export const SparklesIcon = base(
  <path d="M12 3l1.6 4.8L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.2L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15zM5 15l.7 1.9L7.5 17.5l-1.8.6L5 20l-.7-1.9L2.5 17.5l1.8-.6L5 15z" />
);
export const UsersIcon = base(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c0-3.6 2.9-6.2 6.5-6.2S15.5 16.4 15.5 20" />
    <path d="M16 8.2a3.2 3.2 0 110 6.4" />
    <path d="M17 13.9c3 .4 4.5 2.7 4.5 6.1" />
  </>
);
export const BarChartIcon = base(
  <>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </>
);
export const ShieldIcon = base(<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />);
export const WalletIcon = base(
  <>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14.2" r="1" fill="currentColor" stroke="none" />
  </>
);
export const GlobeIcon = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
  </>
);
export const FileTextIcon = base(
  <>
    <path d="M6 2.5h8l4 4V20a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 20V4A1.5 1.5 0 015.5 2.5z" />
    <path d="M14 2.5V7h4.5M8 12h8M8 15.5h8M8 8.5h3" />
  </>
);
export const LayersIcon = base(
  <>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </>
);
export const ClockIcon = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>
);
export const PlusIcon = base(<path d="M12 5v14M5 12h14" />);
export const MoreIcon = base(
  <>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </>
);
export const CopyIcon = base(
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
  </>
);
export const BellIcon = base(<path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10zM10 19a2 2 0 004 0" />);
export const SearchIcon = base(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>
);
export const XIcon = base(<path d="M18 6L6 18M6 6l12 12" />);
export const MenuIcon = base(<path d="M4 7h16M4 12h16M4 17h16" />);
export const ChevronDownIcon = base(<path d="M6 9l6 6 6-6" />);
export const DownloadIcon = base(
  <>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M4 19h16" />
  </>
);
export const QrIcon = base(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" />
  </>
);
export const LinkIcon = base(
  <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
);
export const CodeIcon = base(<path d="M8 5L2 12l6 7M16 5l6 7-6 7M13 3l-2 18" />);
export const AlertIcon = base(
  <>
    <path d="M12 3.5L21.5 20h-19L12 3.5z" />
    <path d="M12 10v4M12 17h.01" />
  </>
);
export const SettingsIcon = base(
  <>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a7.6 7.6 0 000-3l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-2.6-1.5L14 2h-4l-.4 2.5a7.6 7.6 0 00-2.6 1.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 000 3l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 002.6 1.5L10 22h4l.4-2.5a7.6 7.6 0 002.6-1.5l2.4 1 2-3.4-2-1.6z" />
  </>
);
export const LogOutIcon = base(<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />);
export const CreditCardIcon = base(
  <>
    <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
    <path d="M2.5 10h19M6 15h4" />
  </>
);
export const TrendingUpIcon = base(<path d="M3 17l6-6 4 4 8-8M15 7h6v6" />);
export const TargetIcon = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </>
);
export const EyeIcon = base(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
export const FlagIcon = base(<path d="M6 3v18M6 4h11l-2.5 4L17 12H6" />);
export const TrashIcon = base(
  <>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
  </>
);
export const PauseIcon = base(
  <>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </>
);
export const PlayIcon = base(<path d="M7 4l13 8-13 8V4z" />);
export const EditIcon = base(<path d="M3 21l3.5-.9L18.5 8.1a2 2 0 000-2.8L18 4.5a2 2 0 00-2.8 0L3.5 16.2 3 21zM14 6.5L17.5 10" />);
export const RobotIcon = base(
  <>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <path d="M12 2v4M9 13v2M15 13v2" />
    <circle cx="9" cy="13" r="0.5" fill="currentColor" />
    <circle cx="15" cy="13" r="0.5" fill="currentColor" />
  </>
);
export const HomeIcon = base(
  <>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 9.5V20a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1V9.5" />
  </>
);
export const ListIcon = base(
  <>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
  </>
);
export const SunIcon = base(
  <>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.3M12 19.2v2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
  </>
);
export const MoonIcon = base(<path d="M20.5 14.5A8.5 8.5 0 019.5 3.5a8.5 8.5 0 1011 11z" />);
export const InboxIcon = base(
  <>
    <path d="M3 12h4.5l1.5 3h6l1.5-3H21" />
    <path d="M5.5 5h13L21 12v6a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18v-6L5.5 5z" />
  </>
);

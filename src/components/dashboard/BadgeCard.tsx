import { Badge, UserBadge } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Target, Zap, Shield, Crown, Coins, Medal, Diamond } from 'lucide-react';

interface BadgeCardProps {
  badge: Badge;
  userBadge?: UserBadge;
}

const getIcon = (iconName: string, isUnlocked: boolean) => {
  const props = {
    className: `w-8 h-8 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`,
  };
  
  switch (iconName) {
    case 'Trophy': return <Trophy {...props} />;
    case 'Star': return <Star {...props} />;
    case 'Target': return <Target {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'Crown': return <Crown {...props} />;
    case 'Coins': return <Coins {...props} />;
    case 'Medal': return <Medal {...props} />;
    case 'Diamond': return <Diamond {...props} />;
    default: return <Trophy {...props} />;
  }
};

export function BadgeCard({ badge, userBadge }: BadgeCardProps) {
  const isUnlocked = !!userBadge;

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isUnlocked ? 'border-primary/50 bg-primary/5 shadow-sm' : 'border-border opacity-70 grayscale-[50%]'}`}>
      <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3 sm:space-y-4">
        <div className={`p-3 sm:p-4 rounded-full ${isUnlocked ? 'bg-primary/20' : 'bg-muted'}`}>
          {getIcon(badge.icon, isUnlocked)}
        </div>
        
        <div className="space-y-1">
          <h4 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {badge.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {badge.description}
          </p>
        </div>
        
        <div className="w-full pt-4 border-t border-border flex flex-wrap justify-between items-center gap-2 text-xs text-muted-foreground">
          <span>{badge.xpReward} XP</span>
          {isUnlocked ? (
            <span className="text-primary font-medium">Earned {new Date(userBadge.unlockedAt).toLocaleDateString()}</span>
          ) : (
            <span>Locked</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

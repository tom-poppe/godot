<?php

namespace App\Security;

use App\Entity\User;
use App\Entity\Note;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class EntityVoter extends Voter
{
    const ACCESS = "access";

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::ACCESS])) {
            return false;
        }

        if (!$subject instanceof Note) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            // the user must be logged in; if not, deny access
            return false;
        }

        return $user === $subject->getUser();
    }
}
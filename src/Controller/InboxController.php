<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\NoteRepository;

class InboxController extends AbstractController
{
    #[Route('/inbox', name: 'app_inbox_index')]
    public function index(NoteRepository $noteRepository): Response
    {
        $notes = $noteRepository->findBy([
                                            "processedAt" => null,
                                            "deletedAt" => null,
                                            "user" => $this->getUser(),
                                        ]);

        return $this->render('inbox/index.html.twig', [
            'notes' => $notes,
        ]);
    }
}
